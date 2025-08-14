import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Globe, Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  includeImages: z.boolean().default(true),
  includeFonts: z.boolean().default(true),
  includeJS: z.boolean().default(true),
  followSubdomains: z.boolean().default(false),
  maxDepth: z.number().min(1).max(10).default(3),
});

type FormData = z.infer<typeof formSchema>;

interface WebCloneFormProps {
  onCloneStart: (jobId: string) => void;
}

export function WebCloneForm({ onCloneStart }: WebCloneFormProps) {
  const [maxDepthValue, setMaxDepthValue] = useState(3);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      includeImages: true,
      includeFonts: true,
      includeJS: true,
      followSubdomains: false,
      maxDepth: 3,
    },
  });

  const createCloneJob = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/clone-jobs", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Clone job started",
        description: "Website cloning has begun. You can monitor the progress below.",
      });
      onCloneStart(data.id);
    },
    onError: (error) => {
      toast({
        title: "Error starting clone job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createCloneJob.mutate(data);
  };

  return (
    <div className="bg-card-bg/50 glass-effect rounded-2xl p-8 mb-8 shadow-2xl">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center">
          <Globe className="text-white w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-white">Website Cloner</h3>
          <p className="text-gray-400">Enter any website URL to begin cloning</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300 flex items-center">
                  <Globe className="mr-2 w-4 h-4" />
                  Website URL
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      placeholder="https://example.com"
                      className="w-full px-4 py-4 pl-12 bg-slate-800/70 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    />
                    <Globe className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Advanced Options */}
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-600">
            <h4 className="text-lg font-medium text-white mb-4 flex items-center">
              <Settings className="mr-2 w-5 h-5 text-accent" />
              Advanced Options
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <FormField
                control={form.control}
                name="includeImages"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="w-5 h-5"
                      />
                    </FormControl>
                    <FormLabel className="text-gray-300 cursor-pointer">Include Images</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="includeFonts"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="w-5 h-5"
                      />
                    </FormControl>
                    <FormLabel className="text-gray-300 cursor-pointer">Include Fonts</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="includeJS"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="w-5 h-5"
                      />
                    </FormControl>
                    <FormLabel className="text-gray-300 cursor-pointer">Include JavaScript</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="followSubdomains"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="w-5 h-5"
                      />
                    </FormControl>
                    <FormLabel className="text-gray-300 cursor-pointer">Follow Subdomains</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="maxDepth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-300 mb-2">
                    Maximum Depth Level
                  </FormLabel>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={(value) => {
                        field.onChange(value[0]);
                        setMaxDepthValue(value[0]);
                      }}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </FormControl>
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>1</span>
                    <span className="font-medium">Current: {maxDepthValue}</span>
                    <span>10</span>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={createCloneJob.isPending}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center space-x-3"
          >
            <Download className="w-5 h-5" />
            <span>{createCloneJob.isPending ? "Starting Clone..." : "Start Cloning Website"}</span>
          </Button>
        </form>
      </Form>
    </div>
  );
}
