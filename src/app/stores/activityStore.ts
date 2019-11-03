import { observable, action, computed, runInAction } from 'mobx';
import { SyntheticEvent } from 'react';
import { IActivity } from './../models/activity';
import agent from '../api/agent';
import { history } from './../../index';
import { toast } from 'react-toastify';
import { RootStore } from './rootStore';

export default class ActivityStore {
	rootStore: RootStore;
	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
	}

  @observable activityRegistry = new Map();
  @observable activity: IActivity | null = null;
  @observable loadingInitial: boolean = false;
  @observable submitting = false;
  @observable target = '';

  @computed get activitiesByDate() {
    return this.groupActivitiesByDate(Array.from(this.activityRegistry.values()));
	}
	
	groupActivitiesByDate(activities: IActivity[]) {
		const sortedActivities = activities.sort(
			(a, b) => a.date.getTime() - b.date.getTime()
		);
		return Object.entries(sortedActivities.reduce((activities, activity) => {
			const date = activity.date.toISOString().split('T')[0];
			activities[date] = activities[date] ? [...activities[date], activity] : [activity];
			return activities;
		}, {} as {[key: string]: IActivity[]}));
	}

  @action loadActivities = async () => {
    this.loadingInitial = true;
    try {
      const activities = await agent.Activities.list();
      runInAction('loading activities', () => {
        activities.forEach(activity => {
          activity.date = new Date(activity.date);
          this.activityRegistry.set(activity.id, activity);
        });
			});
    } catch (error) {
      console.log(error);
    } finally {
      runInAction('loading activity finally', () => {
        this.loadingInitial = false;
      });
    }
  };

  @action loadActivity = async (id: string) => {
    let activity = this.getActivity(id);
    if (activity) {
			this.activity = activity;
			return activity;
    } else {
      this.loadingInitial = true;
      try {
        activity = await agent.Activities.details(id);
        runInAction('getting activity', () => {
					activity.date = new Date(activity.date);
					this.activity = activity;
					this.activityRegistry.set(activity.id, activity);
				});
				return activity;
      } catch (error) {
        console.log(error);
      } finally {
        runInAction('getting activity finally', () => {
          this.loadingInitial = false;
        });
      }
    }
	};
	
	@action clearActivity = () => {
		this.activity = null;
	}

  getActivity = (id: string) => {
    return this.activityRegistry.get(id);
  };

  @action createActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.create(activity);
      runInAction('create activity', () => {
        this.activityRegistry.set(activity.id, activity);
			});
			history.push(`/activities/${activity.id}`)
    } catch (error) {
			console.log(error);
			toast.error('Problem submitting data');
    } finally {
      runInAction('create activity finally', () => {
        this.submitting = false;
      });
    }
  };

  @action editActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.update(activity);
      runInAction('edit activity', () => {
        this.activityRegistry.set(activity.id, activity);
        this.activity = activity;
			});
			history.push(`/activities/${activity.id}`)
    } catch (error) {
      console.log(error);
    } finally {
      runInAction('edit activity finally', () => {
        this.submitting = false;
      });
    }
  };

  @action deleteActivity = async (
    event: SyntheticEvent<HTMLButtonElement>,
    id: string
  ) => {
    this.submitting = true;
    this.target = event.currentTarget.name;
    try {
      await agent.Activities.delete(id);
      runInAction('delete activity', () => {
        this.activityRegistry.delete(id);
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction('delete activity finally', () => {
        this.submitting = false;
        this.target = '';
      });
    }
  };
}

