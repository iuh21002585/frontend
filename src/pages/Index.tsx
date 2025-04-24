import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Shield, BookOpen, AlertTriangle, FileCheck, BookMarked, Award, GraduationCap, Building } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";

// Thành phần Feature Card với animation
const FeatureCard = ({ icon, title, description, delay = 0 }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
      className="bg-card hover:bg-accent/50 transition-colors rounded-xl p-6 shadow-md hover:shadow-lg border border-border"
    >
      <div className="flex items-start">
        <div className="bg-primary/10 p-3 rounded-full mr-4">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Thành phần Counter Animation
const CounterAnimation = ({ end, suffix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (!inView) return;

    let startTime;
    let animationFrame;

    const updateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);

    return () => cancelAnimationFrame(animationFrame);
  }, [inView, end, duration]);

  return (
    <div ref={ref} className="text-4xl font-bold">
      {count}
      {suffix}
    </div>
  );
};

const Index = () => {
  // Animation variants cho hero section
  const heroVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    },
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section với animation */}
      <motion.div
        className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border"
        initial="hidden"
        animate="visible"
        variants={heroVariants}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div variants={itemVariants} className="inline-block mb-6">
              <div className="flex items-center justify-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-border">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Bảo vệ tính học thuật</span>
              </div>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants} 
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500"
            >
              Hệ thống quản lý luận văn thông minh
            </motion.h1>
            
            <motion.p 
              variants={itemVariants} 
              className="text-xl text-muted-foreground mb-8"
            >
              Nền tảng hiện đại giúp quản lý, lưu trữ và kiểm tra đạo văn cho luận văn và báo cáo tốt nghiệp với công nghệ AI tiên tiến
            </motion.p>
            
            <motion.div 
              variants={itemVariants} 
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-primary hover:bg-primary/90 font-medium" asChild>
                <Link to="/register">Bắt đầu ngay</Link>
              </Button>
              <Button size="lg" variant="outline" className="font-medium" asChild>
                <Link to="/login">Đăng nhập</Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
      </motion.div>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <CounterAnimation end={5000} suffix="+" />
              <p className="text-muted-foreground">Luận văn đã kiểm tra</p>
            </div>
            <div className="space-y-2">
              <CounterAnimation end={98} suffix="%" />
              <p className="text-muted-foreground">Độ chính xác</p>
            </div>
            <div className="space-y-2">
              <CounterAnimation end={50} suffix="+" />
              <p className="text-muted-foreground">Trường đại học</p>
            </div>
            <div className="space-y-2">
              <CounterAnimation end={24} suffix="/7" />
              <p className="text-muted-foreground">Hỗ trợ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-4"
            >
              Tính năng vượt trội
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              IUH_PLAGCHECK cung cấp các công cụ tiên tiến để phát hiện đạo văn và bảo vệ tính nguyên bản trong nghiên cứu học thuật
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BookOpen className="w-6 h-6 text-primary" />}
              title="Phát hiện đạo văn truyền thống"
              description="Kiểm tra tài liệu của bạn với hàng triệu tài liệu đã xuất bản và nội dung web để đảm bảo tính nguyên bản."
              delay={0}
            />
            <FeatureCard 
              icon={<AlertTriangle className="w-6 h-6 text-primary" />}
              title="Phát hiện đạo văn AI"
              description="Công nghệ tiên tiến phát hiện nội dung được tạo bởi AI, giúp đảm bảo tính chính trực học thuật."
              delay={0.1}
            />
            <FeatureCard 
              icon={<FileCheck className="w-6 h-6 text-primary" />}
              title="Báo cáo chi tiết"
              description="Nhận báo cáo chi tiết về các phần đạo văn, nguồn gốc và tỷ lệ đạo văn trong tài liệu của bạn."
              delay={0.2}
            />
            <FeatureCard 
              icon={<BookMarked className="w-6 h-6 text-primary" />}
              title="Quản lý tài liệu"
              description="Quản lý và tổ chức tất cả các luận văn và tài liệu nghiên cứu của bạn trong một nền tảng duy nhất."
              delay={0.3}
            />
            <FeatureCard 
              icon={<Award className="w-6 h-6 text-primary" />}
              title="Chứng chỉ tính nguyên bản"
              description="Nhận chứng chỉ tính nguyên bản có thể xác minh để nộp cùng với luận văn của bạn."
              delay={0.4}
            />
            <FeatureCard 
              icon={<GraduationCap className="w-6 h-6 text-primary" />}
              title="Phù hợp với môi trường học thuật"
              description="Được thiết kế đặc biệt để đáp ứng nhu cầu của sinh viên, giảng viên và các trường đại học."
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* Hỗ trợ đa ngành */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-4"
            >
              Dành cho mọi khoa ngành
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              Hệ thống của chúng tôi được thiết kế để phục vụ tất cả các khoa ngành, từ kỹ thuật đến khoa học 
              xã hội, giúp đảm bảo tính nguyên bản trong mọi lĩnh vực học thuật.
            </motion.p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 justify-items-center">
            {['Công nghệ', 'Kinh tế', 'Y học', 'Giáo dục', 'Luật', 'Nghệ thuật'].map((field, index) => (
              <motion.div
                key={field}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-background rounded-xl p-4 shadow-sm w-full max-w-[150px] aspect-square flex flex-col items-center justify-center text-center border border-border"
              >
                <Building className="w-8 h-8 text-primary mb-2" />
                <span className="font-medium">{field}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/20 to-indigo-500/20">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-6">Bắt đầu bảo vệ tính học thuật của bạn ngay hôm nay</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Đăng ký tài khoản miễn phí và trải nghiệm sức mạnh của IUH_PLAGCHECK trong việc phát hiện và ngăn chặn đạo văn.
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
              <Link to="/register">Đăng ký ngay</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
