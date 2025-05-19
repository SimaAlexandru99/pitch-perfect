import {Control, Controller, FieldValues, Path} from "react-hook-form";

import {
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";

interface FormFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    placeholder?: string;
    type?: "text" | "email" | "password";
    className?: string;
}

const FormField = <T extends FieldValues>({
                                              control,
                                              name,
                                              label,
                                              placeholder,
                                              type = "text",
                                              className,
                                          }: FormFieldProps<T>) => (
    <Controller
        control={control}
        name={name}
        render={({field}) => (
            <FormItem className={className}>
                <FormLabel htmlFor={name}>{label}</FormLabel>
                <FormControl>
                    <Input id={name} type={type} placeholder={placeholder} {...field} />
                </FormControl>
                <FormMessage/>
            </FormItem>
        )}
    />
);

export default FormField;
