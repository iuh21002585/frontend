
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  maxPlagiarismPercentage: z.coerce.number().min(0).max(100),
  maxAiPlagiarismPercentage: z.coerce.number().min(0).max(100),
  enableAiPlagiarismCheck: z.boolean().default(true),
  maxFileSize: z.coerce.number().min(1).max(100),
  oldPassword: z.string().min(6, {
    message: "Mật khẩu cũ phải có ít nhất 6 ký tự",
  }),
  newPassword: z.string().min(6, {
    message: "Mật khẩu mới phải có ít nhất 6 ký tự",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const AdminSettings = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      maxPlagiarismPercentage: 15,
      maxAiPlagiarismPercentage: 10,
      enableAiPlagiarismCheck: true,
      maxFileSize: 20,
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSaving(true);
      
      // Giả lập lưu cài đặt
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: "Lưu cài đặt thành công",
        description: "Các cài đặt hệ thống đã được cập nhật",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi lưu cài đặt",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setIsChangingPassword(true);
      
      // Giả lập đổi mật khẩu
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: "Đổi mật khẩu thành công",
        description: "Mật khẩu quản trị viên đã được cập nhật",
      });
      
      // Reset trường mật khẩu
      form.setValue("oldPassword", "");
      form.setValue("newPassword", "");
      form.setValue("confirmPassword", "");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi đổi mật khẩu",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt hệ thống</CardTitle>
          <CardDescription>
            Quản lý các thiết lập cho hệ thống kiểm tra đạo văn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="maxPlagiarismPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tỷ lệ đạo văn truyền thống tối đa (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={100} {...field} />
                      </FormControl>
                      <FormDescription>
                        Tỷ lệ đạo văn truyền thống tối đa cho phép trong luận văn
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxAiPlagiarismPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tỷ lệ đạo văn AI tối đa (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={100} {...field} />
                      </FormControl>
                      <FormDescription>
                        Tỷ lệ đạo văn AI tối đa cho phép trong luận văn
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxFileSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kích thước file tối đa (MB)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={100} {...field} />
                      </FormControl>
                      <FormDescription>
                        Kích thước tối đa của file luận văn được tải lên
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="enableAiPlagiarismCheck"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Bật kiểm tra đạo văn AI</FormLabel>
                        <FormDescription>
                          Bật tính năng phát hiện nội dung được tạo bởi AI
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Đang lưu..." : "Lưu cài đặt"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu quản trị viên</CardTitle>
          <CardDescription>
            Cập nhật mật khẩu tài khoản quản trị viên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6">
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu cũ</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Nhập mật khẩu cũ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Nhập mật khẩu mới" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Nhập lại mật khẩu mới" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleChangePassword} 
            disabled={isChangingPassword || !form.getValues("oldPassword") || !form.getValues("newPassword") || !form.getValues("confirmPassword")}
          >
            {isChangingPassword ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminSettings;
