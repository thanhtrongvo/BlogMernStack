import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Eye, FileText, MessageSquare, Users, TrendingUp, AlertCircle, Loader2, FolderOpen } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { dashboardAPI, type ChartDataPoint, type TopPost } from '@/shared/services/dashboard';
import { type DashboardStats, type ApiPost, type ApiComment } from '@/shared/types';
import { useToast } from '@/shared/components/ui/use-toast';

export function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    stats: {
      postCount: 0,
      userCount: 0,
      commentCount: 0,
      totalViews: 0
    },
    updatedAt: new Date().toISOString()
  });
  const [categoriesCount, setCategoriesCount] = useState<number>(0);
  const [weeklyData, setWeeklyData] = useState<ChartDataPoint[]>([]);
  const [monthlyData, setMonthlyData] = useState<ChartDataPoint[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [recentPosts, setRecentPosts] = useState<ApiPost[]>([]);
  const [recentComments, setRecentComments] = useState<ApiComment[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all data in parallel
        const [
          statsData, 
          weeklyViewsData, 
          monthlyViewsData, 
          topPostsData,
          recentPostsData,
          recentCommentsData,
          categoriesCountData
        ] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getWeeklyViews(),
          dashboardAPI.getMonthlyViews(),
          dashboardAPI.getTopPosts(5),
          dashboardAPI.getRecentPosts(5),
          dashboardAPI.getRecentComments(5),
          dashboardAPI.getCategoriesCount()
        ]);
        
        setStats(statsData);
        setWeeklyData(weeklyViewsData);
        setMonthlyData(monthlyViewsData);
        setTopPosts(topPostsData);
        setRecentPosts(recentPostsData);
        setRecentComments(recentCommentsData);
        setCategoriesCount(categoriesCountData);
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
                  <h4 className="text-3xl font-bold">{stats.stats.totalViews.toLocaleString()}</h4>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
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
                  <h4 className="text-3xl font-bold">{stats.stats.postCount}</h4>
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    <FileText className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
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
                  <h4 className="text-3xl font-bold">{stats.stats.userCount}</h4>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    <Users className="h-3 w-3 mr-1" />
                    Total
                  </Badge>
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
                  <h4 className="text-3xl font-bold">{stats.stats.commentCount}</h4>
                  <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Total
                  </Badge>
                </div>
              </div>
              <div className="bg-yellow-500/10 p-3 rounded-full">
                <MessageSquare className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Categories Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Danh mục</p>
                <div className="flex items-baseline space-x-2">
                  <h4 className="text-3xl font-bold">{categoriesCount}</h4>
                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                    <FolderOpen className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-full">
                <FolderOpen className="h-6 w-6 text-purple-500" />
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

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Bài viết gần đây
            </CardTitle>
            <CardDescription>5 bài viết được tạo gần đây nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.length > 0 ? recentPosts.map((post) => (
                <div 
                  key={post._id} 
                  className="flex items-start justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium line-clamp-2 mb-1">{post.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Tác giả: {typeof post.author === 'object' ? post.author.name : post.author}</span>
                      <span>•</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <Badge 
                        variant="outline" 
                        className="text-xs px-2 py-0"
                      >
                        {post.category?.name || 'Không có danh mục'}
                      </Badge>
                      <Badge 
                        variant={post.status ? 'default' : 'secondary'} 
                        className="text-xs px-2 py-0"
                      >
                        {post.status ? 'Đã xuất bản' : 'Nháp'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground ml-3">
                    <Eye className="h-3 w-3" />
                    <span>{post.views || 0}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Chưa có bài viết nào</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Comments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Bình luận gần đây
            </CardTitle>
            <CardDescription>5 bình luận được tạo gần đây nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentComments.length > 0 ? recentComments.map((comment) => (
                <div 
                  key={comment._id} 
                  className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{typeof comment.author === 'object' ? comment.author.name : comment.author}</span>
                      <Badge 
                        variant="default"
                        className="text-xs px-2 py-0"
                      >
                        Đã xuất bản
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Bài viết: {typeof comment.postId === 'object' ? comment.postId.title : 'Không xác định'}</span>
                      <span>•</span>
                      <span>{formatDate(comment.createdAt)}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Chưa có bình luận nào</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
