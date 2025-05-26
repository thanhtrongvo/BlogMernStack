import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Eye, FileText, MessageSquare, Users, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { dashboardAPI, type ChartDataPoint, type TopPost } from '@/shared/services/dashboard';
import { type DashboardStats } from '@/shared/types';
import { useToast } from '@/shared/components/ui/use-toast';

export function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalUsers: 0,
    totalComments: 0,
    totalCategories: 0,
    recentPosts: [],
    popularPosts: [],
    recentComments: []
  });
  const [weeklyData, setWeeklyData] = useState<ChartDataPoint[]>([]);
  const [monthlyData, setMonthlyData] = useState<ChartDataPoint[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all data in parallel
        const [statsData, weeklyViewsData, monthlyViewsData, topPostsData] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getWeeklyViews(),
          dashboardAPI.getMonthlyViews(),
          dashboardAPI.getTopPosts(5)
        ]);
        
        setStats(statsData);
        setWeeklyData(weeklyViewsData);
        setMonthlyData(monthlyViewsData);
        setTopPosts(topPostsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
        toast({
          title: 'Lỗi tải dữ liệu',
          description: 'Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [toast]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-medium mb-2">Đã xảy ra lỗi</p>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button 
          className="px-4 py-2 bg-primary text-white rounded-md"
          onClick={() => window.location.reload()}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tổng quan Dashboard</h1>
          <p className="text-muted-foreground">Xem các số liệu và hoạt động trên blog của bạn</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Badge variant="outline" className="bg-white py-1 px-3 text-xs">
            Dữ liệu cập nhật: {formatDate(new Date().toISOString())}
          </Badge>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Tổng lượt xem</p>
                <div className="flex items-baseline space-x-2">
                  <h4 className="text-3xl font-bold">{weeklyData.reduce((sum, item) => sum + item.views, 0).toLocaleString()}</h4>
                  <Badge variant="success" className="text-xs">+12.5%</Badge>
                </div>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Eye className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Bài viết</p>
                <div className="flex items-baseline space-x-2">
                  <h4 className="text-3xl font-bold">{stats.totalPosts}</h4>
                  <Badge variant="success" className="text-xs">+3</Badge>
                </div>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-full">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Người dùng</p>
                <div className="flex items-baseline space-x-2">
                  <h4 className="text-3xl font-bold">{stats.totalUsers}</h4>
                  <Badge variant="success" className="text-xs">+8.2%</Badge>
                </div>
              </div>
              <div className="bg-green-500/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Bình luận</p>
                <div className="flex items-baseline space-x-2">
                  <h4 className="text-3xl font-bold">{stats.totalComments}</h4>
                  <Badge variant="warning" className="text-xs">+5</Badge>
                </div>
              </div>
              <div className="bg-yellow-500/10 p-3 rounded-full">
                <MessageSquare className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thống kê lượt xem</CardTitle>
            <CardDescription>Biểu đồ lượt xem trên blog của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="weekly">
              <div className="flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="weekly">Tuần</TabsTrigger>
                  <TabsTrigger value="monthly">Tháng</TabsTrigger>
                </TabsList>
                <div className="flex items-center text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                  <span className="text-green-500 font-medium">+14.2%</span>
                  <span className="ml-1">so với kỳ trước</span>
                </div>
              </div>
              
              <TabsContent value="weekly" className="pt-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`${value} lượt xem`, 'Lượt xem']}
                      />
                      <Bar dataKey="views" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="monthly" className="pt-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`${value} lượt xem`, 'Lượt xem']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="views" 
                        stroke="#6366F1" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Top bài viết xem nhiều</CardTitle>
            <CardDescription>Các bài viết được xem nhiều nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPosts.map((post, index) => (
                <div 
                  key={post.id} 
                  className="flex items-start justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium line-clamp-2">{post.title}</p>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="text-xs px-2 py-0">
                          {post.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center whitespace-nowrap text-sm text-muted-foreground">
                    <Eye className="h-3 w-3 mr-1" />
                    {post.views}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
