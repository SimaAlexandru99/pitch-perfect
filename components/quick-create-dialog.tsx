"use client";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {domains} from "@/constants";
import {cn} from "@/lib/utils";
import {zodResolver} from "@hookform/resolvers/zod";
import {useEffect, useState} from "react";
import {FormProvider, useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

const levelOptions = [
    {label: "Beginner", value: "beginner"},
    {label: "Intermediate", value: "intermediate"},
    {label: "Advanced", value: "advanced"},
];

const schema = z.object({
    title: z.string().min(2, "Title is required"),
    domain: z.string().min(1, "Domain is required"),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    description: z.string().min(5, "Description is required"),
});

type FormValues = z.infer<typeof schema>;

interface QuickCreateDialogProps {
    selectedDomain?: string;
}

export function QuickCreateDialog({selectedDomain}: QuickCreateDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: "",
            domain: selectedDomain || "",
            level: "beginner",
            description: "",
        },
    });

    useEffect(() => {
        if (selectedDomain) {
            form.setValue("domain", selectedDomain);
        }
    }, [selectedDomain, form]);

    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/sales-jobs", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(values),
            });
            if (!res.ok) throw new Error("Failed to create job");
            form.reset();
            toast.success("Sales job created successfully!");
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Unknown error";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedDomainInfo = selectedDomain
        ? domains.find((d) => d.value === selectedDomain)
        : null;

    return (
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader className="space-y-3">
                <DialogTitle className="text-2xl font-bold">
                    Quick Create Sales Job
                </DialogTitle>
                <DialogDescription className="text-base">
                    {selectedDomainInfo ? (
                        <>
                            Create a new sales job in the{" "}
                            <span className="font-medium text-primary">
                {selectedDomainInfo.label}
              </span>{" "}
                            domain. This will help you practice your sales skills in this
                            specific industry.
                        </>
                    ) : (
                        "Fill in the details to quickly add a new sales job. This will help you practice your sales skills in a specific domain."
                    )}
                </DialogDescription>
            </DialogHeader>
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                    <FormField
                        name="title"
                        control={form.control}
                        render={({field}) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-base">Title</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., Senior Sales Representative"
                                        className="h-11"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="domain"
                        control={form.control}
                        render={({field}) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-base">Domain</FormLabel>
                                <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Select a sales domain"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {domains.map((domain) => {
                                                const Icon = domain.icon;
                                                return (
                                                    <SelectItem
                                                        key={domain.value}
                                                        value={domain.value}
                                                        className="py-2"
                                                    >
                            <span className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-primary"/>
                              <span className="font-medium">
                                {domain.label}
                              </span>
                            </span>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="level"
                        control={form.control}
                        render={({field}) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-base">Experience Level</FormLabel>
                                <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Select experience level"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {levelOptions.map((level) => (
                                                <SelectItem
                                                    key={level.value}
                                                    value={level.value}
                                                    className="py-2"
                                                >
                          <span className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className={cn(
                                    "px-2 py-0.5",
                                    level.value === "beginner" &&
                                    "bg-green-500/10 text-green-500",
                                    level.value === "intermediate" &&
                                    "bg-blue-500/10 text-blue-500",
                                    level.value === "advanced" &&
                                    "bg-purple-500/10 text-purple-500"
                                )}
                            >
                              {level.label}
                            </Badge>
                          </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="description"
                        control={form.control}
                        render={({field}) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-base">Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Describe the sales scenario and key objectives..."
                                        className="min-h-[120px] resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={isLoading} className="h-11 px-8">
                            {isLoading && (
                                <svg
                                    className="animate-spin mr-2 h-4 w-4 text-white inline"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                </svg>
                            )}
                            {isLoading ? "Creating..." : "Create Job"}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </DialogContent>
    );
}
