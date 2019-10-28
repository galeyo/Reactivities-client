import React from 'react';
import { FieldRenderProps } from 'react-final-form';
import { FormFieldProps, Form, Label } from 'semantic-ui-react';
import { DateTimePicker } from 'react-widgets';
interface IProps
  extends FieldRenderProps<Date | undefined, HTMLInputElement>,
    FormFieldProps {}
const DateInput: React.FC<IProps> = ({
  input,
	width,
	date=false,
	time=false,
  placeholder,
  meta: { touched, error },
  ...rest
}) => {
  return (
    <Form.Field error={touched && !!error} width={width}>
      <DateTimePicker
        placeholder={placeholder}
				value={input.value || undefined}
				onBlur={input.onBlur}
				onKeyDown={(e) => e.preventDefault()}
				date={date}
				time={time}
        onChange={input.onChange}
        {...rest}
      />
      {touched && error && (
        <Label basic color='red'>
          {error}
        </Label>
      )}
    </Form.Field>
  );
};

export default DateInput;
