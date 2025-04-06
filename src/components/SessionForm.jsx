"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function SessionForm({ onSessionCreated }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      subject: "",
      date: new Date().toISOString().slice(0, 16),
      expiresAt: new Date(Date.now() + 3600000).toISOString().slice(0, 16), // Default 1 hour from now
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Session created successfully",
        });
        reset();
        if (onSessionCreated) {
          onSessionCreated(result.data);
        }
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create session",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Create session error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
        <CardTitle className="text-lg sm:text-xl">Create Session</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Create a new attendance session
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="e.g., Mathematics 101"
              {...register("subject", {
                required: "Subject is required",
                maxLength: {
                  value: 100,
                  message: "Subject cannot be more than 100 characters",
                },
              })}
            />
            {errors.subject && (
              <p className="text-sm text-red-500">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date & Time</Label>
            <Input
              id="date"
              type="datetime-local"
              {...register("date", {
                required: "Date is required",
              })}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expires At</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              {...register("expiresAt", {
                required: "Expiration time is required",
                validate: (value, { date }) =>
                  new Date(value) > new Date(date) ||
                  "Expiration time must be after the session start time",
              })}
            />
            {errors.expiresAt && (
              <p className="text-sm text-red-500">{errors.expiresAt.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Session"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
