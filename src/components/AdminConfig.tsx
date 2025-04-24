import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

// Định nghĩa schema cho biểu mẫu
const formSchema = z.object({
  // Cấu hình truyền thống
  maxPlagiarismPercentage: z.number().min(0).max(100),
  
  // Cấu hình AI
  useAIDetection: z.boolean().default(true),
  aiThreshold: z.number().min(0).max(100).default(70),
  preferredModel: z.enum(["gpt-4o", "gemini-pro", "claude-3", "local"]).default("gpt-4o"),
});

type FormValues = z.infer<typeof formSchema>;

// Kiểu dữ liệu cho tab
type ConfigTab = "traditional" | "ai";

const AdminConfig = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ConfigTab>("traditional");

  // Khởi tạo form với giá trị mặc định
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Cấu hình truyền thống
      maxPlagiarismPercentage: 30,
      
      // Cấu hình AI
      useAIDetection: true,
      aiThreshold: 50, // Đặt giá trị mặc định thấp hơn để người dùng có thể điều chỉnh
      preferredModel: "gpt-4o",
    },
  });
  
  // Thêm vào initDefaultConfigs để đảm bảo cấu hình AI cũng được khởi tạo
  const addAIConfigsToDefault = async () => {
    try {
      // Kiểm tra xem cấu hình đã tồn tại chưa trước khi tạo mới
      
      // Kiểm tra useAIDetection
      try {
        await api.get('/config/useAIDetection');
      } catch {
        // Chỉ tạo nếu chưa tồn tại
        await api.post('/config/useAIDetection', {
          value: true,
          description: 'Kích hoạt tính năng phát hiện đạo văn bằng AI'
        });
      }
      
      // Kiểm tra aiThreshold
      try {
        await api.get('/config/aiThreshold');
      } catch {
        // Chỉ tạo nếu chưa tồn tại
        await api.post('/config/aiThreshold', {
          value: 50,
          description: 'Ngưỡng tin cậy tối thiểu để AI xác định đạo văn'
        });
      }
      
      // Kiểm tra preferredModel
      try {
        await api.get('/config/preferredModel');
      } catch {
        // Chỉ tạo nếu chưa tồn tại
        await api.post('/config/preferredModel', {
          value: "gpt-4o",
          description: 'Mô hình AI ưu tiên cho phát hiện đạo văn'
        });
      }
    } catch (error) {
      console.error('Lỗi khi tạo cấu hình AI mặc định:', error);
    }
  };

  // Tải cấu hình khi component được tạo
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        // Tạo cấu hình mặc định nếu chưa có
        await api.post('/config/init');
        // Tạo thêm cấu hình AI mặc định
        await addAIConfigsToDefault();
        
        // Lấy cấu hình truyền thống
        const traditionalResponse = await api.get('/config/maxPlagiarismPercentage');
        if (traditionalResponse.data && traditionalResponse.data.value !== undefined) {
          form.setValue('maxPlagiarismPercentage', traditionalResponse.data.value);
        }
        
        // Lấy từng cấu hình AI riêng lẻ
        try {
          // Lấy cấu hình useAIDetection
          const useAIDetectionResponse = await api.get('/config/useAIDetection');
          if (useAIDetectionResponse.data && useAIDetectionResponse.data.value !== undefined) {
            form.setValue('useAIDetection', useAIDetectionResponse.data.value);
          }
          
          // Lấy cấu hình aiThreshold
          const aiThresholdResponse = await api.get('/config/aiThreshold');
          if (aiThresholdResponse.data && aiThresholdResponse.data.value !== undefined) {
            form.setValue('aiThreshold', aiThresholdResponse.data.value);
          }
          
          // Lấy cấu hình preferredModel
          const preferredModelResponse = await api.get('/config/preferredModel');
          if (preferredModelResponse.data && preferredModelResponse.data.value !== undefined) {
            form.setValue('preferredModel', preferredModelResponse.data.value);
          }
        } catch (error) {
          console.log('Một số cấu hình AI chưa được thiết lập, sử dụng giá trị mặc định');
        }
      } catch (error) {
        console.error('Lỗi khi tải cấu hình:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải cấu hình. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [form, toast]);

  // Xử lý submit form
  const onSubmit = async (values: FormValues) => {
    try {
      setSaving(true);
      
      // Lưu cấu hình truyền thống
      await api.put(`/config/maxPlagiarismPercentage`, {
        value: values.maxPlagiarismPercentage,
        description: 'Ngưỡng phần trăm đạo văn tối đa cho phép'
      });

      // Lưu từng cấu hình AI riêng lẻ
      await api.put(`/config/useAIDetection`, {
        value: values.useAIDetection,
        description: 'Kích hoạt tính năng phát hiện đạo văn bằng AI'
      });
      
      await api.put(`/config/aiThreshold`, {
        value: values.aiThreshold,
        description: 'Ngưỡng tin cậy tối thiểu để AI xác định đạo văn'
      });
      
      await api.put(`/config/preferredModel`, {
        value: values.preferredModel,
        description: 'Mô hình AI ưu tiên cho phát hiện đạo văn'
      });

      toast({
        title: "Đã lưu cấu hình",
        description: "Cấu hình hệ thống đã được cập nhật thành công.",
      });
    } catch (error) {
      console.error('Lỗi khi lưu cấu hình:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu cấu hình. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Đang tải cấu hình...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Cấu hình hệ thống</CardTitle>
          <CardDescription>
            Thiết lập các cấu hình chung cho hệ thống IUH_PLAGCHECK
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form id="config-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs 
                value={activeTab} 
                onValueChange={(value) => setActiveTab(value as ConfigTab)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="traditional">Cấu hình truyền thống</TabsTrigger>
                  <TabsTrigger value="ai">Cấu hình AI</TabsTrigger>
                </TabsList>
                
                {/* Tab cấu hình truyền thống */}
                <TabsContent value="traditional" className="mt-6">
                  <div className="space-y-6">
                    <div className="text-lg font-medium">Cấu hình kiểm tra đạo văn truyền thống</div>
                    <FormField
                      control={form.control}
                      name="maxPlagiarismPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngưỡng đạo văn tối đa (%)</FormLabel>
                          <FormDescription>
                            Đặt ngưỡng phần trăm đạo văn tối đa cho phép. Luận văn có tỷ lệ đạo văn vượt quá ngưỡng này sẽ bị từ chối tự động.
                          </FormDescription>
                          <div className="flex flex-col space-y-4">
                            <Slider
                              min={0}
                              max={100}
                              step={1}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                            <div className="flex items-center space-x-2">
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                  className="w-20"
                                />
                              </FormControl>
                              <div>%</div>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                {/* Tab cấu hình AI */}
                <TabsContent value="ai" className="mt-6">
                  <div className="space-y-6">
                    <div className="text-lg font-medium">Cấu hình AI cho phát hiện đạo văn</div>
                    
                    <FormField
                      control={form.control}
                      name="useAIDetection"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Sử dụng AI để phát hiện đạo văn</FormLabel>
                            <FormDescription>
                              Kích hoạt tính năng AI để tăng cường khả năng phát hiện đạo văn
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="aiThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngưỡng độ tin cậy AI (%)</FormLabel>
                          <FormDescription>
                            Đặt ngưỡng tin cậy tối thiểu để AI xác định một đoạn văn bản là đạo văn.
                          </FormDescription>
                          <div className="flex flex-col space-y-4">
                            <Slider
                              min={0}
                              max={100}
                              step={1}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              disabled={!form.watch("useAIDetection")}
                            />
                            <div className="flex items-center space-x-2">
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                  className="w-20"
                                  disabled={!form.watch("useAIDetection")}
                                />
                              </FormControl>
                              <div>%</div>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="preferredModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mô hình AI ưu tiên</FormLabel>
                          <FormDescription>
                            Chọn mô hình AI ưu tiên sử dụng cho việc phát hiện đạo văn
                          </FormDescription>
                          <div className="grid grid-cols-2 gap-4">
                            <Button 
                              type="button"
                              variant={field.value === "gpt-4o" ? "default" : "outline"}
                              className="w-full justify-start gap-2"
                              onClick={() => field.onChange("gpt-4o")}
                              disabled={!form.watch("useAIDetection")}
                            >
                              <div className="w-2 h-2 rounded-full bg-green-500" /> GPT-4o
                            </Button>
                            <Button 
                              type="button"
                              variant={field.value === "gemini-pro" ? "default" : "outline"}
                              className="w-full justify-start gap-2"
                              onClick={() => field.onChange("gemini-pro")}
                              disabled={!form.watch("useAIDetection")}
                            >
                              <div className="w-2 h-2 rounded-full bg-blue-500" /> Gemini Pro
                            </Button>
                            <Button 
                              type="button"
                              variant={field.value === "claude-3" ? "default" : "outline"}
                              className="w-full justify-start gap-2"
                              onClick={() => field.onChange("claude-3")}
                              disabled={!form.watch("useAIDetection")}
                            >
                              <div className="w-2 h-2 rounded-full bg-purple-500" /> Claude 3
                            </Button>
                            <Button 
                              type="button"
                              variant={field.value === "local" ? "default" : "outline"}
                              className="w-full justify-start gap-2"
                              onClick={() => field.onChange("local")}
                              disabled={!form.watch("useAIDetection")}
                            >
                              <div className="w-2 h-2 rounded-full bg-orange-500" /> Mô hình cục bộ
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button form="config-form" type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Lưu cấu hình"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminConfig;
