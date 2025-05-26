import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Check, 
  X, 
  Trash, 
  MessageSquare,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { DataTable } from '@/shared/components/ui/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { useToast } from '@/shared/components/ui/use-toast';
import { commentsAPI } from '@/shared/services/api';
import { format } from 'date-fns';

// Define Comment interface
interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    email: string;
  };
  postId: {
    _id: string;
    title: string;
  };
  createdAt: string;
  status: boolean;
  isReported?: boolean;
}

export function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await commentsAPI.getAllComments();
      setComments(data as Comment[]);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách bình luận",
        variant: "destructive"
      });
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveComment = async (id: string) => {
    try {
      await commentsAPI.approveComment(id);
      toast({
        title: "Thành công",
        description: "Bình luận đã được phê duyệt",
      });
      fetchComments(); // Refresh the list
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể phê duyệt bình luận",
        variant: "destructive"
      });
      console.error("Error approving comment:", error);
    }
  };

  const handleRejectComment = async (id: string) => {
    try {
      await commentsAPI.rejectComment(id);
      toast({
        title: "Thành công",
        description: "Bình luận đã bị từ chối",
      });
      fetchComments(); // Refresh the list
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể từ chối bình luận",
        variant: "destructive"
      });
      console.error("Error rejecting comment:", error);
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await commentsAPI.deleteComment(id);
      toast({
        title: "Thành công",
        description: "Bình luận đã được xóa",
      });
      fetchComments(); // Refresh the list
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa bình luận",
        variant: "destructive"
      });
      console.error("Error deleting comment:", error);
    }
  };
  
  // Filter comments based on search term and active tab
  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          comment.author.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          comment.postId.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'approved') return matchesSearch && comment.status === true;
    if (activeTab === 'pending') return matchesSearch && comment.status === false;
    if (activeTab === 'reported') return matchesSearch && comment.isReported === true;
    
    return matchesSearch;
  });

  // Helper function to get status badge
  const getStatusBadge = (status: boolean, isReported?: boolean) => {
    if (isReported) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          <span>Đã báo cáo</span>
        </Badge>
      );
    }
    
    if (status) {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <Check className="h-3 w-3" />
          <span>Đã duyệt</span>
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <X className="h-3 w-3" />
        <span>Chờ duyệt</span>
      </Badge>
    );
  };

  // Table columns definition
  const columns = [
    {
      title: 'Nội dung',
      field: 'content' as keyof Comment,
      render: (value: string, comment: Comment) => (
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{comment.author.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{comment.author.username}</p>
              {getStatusBadge(comment.status, comment.isReported)}
            </div>
            <p className="text-sm mt-1 line-clamp-2">{value}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm')}
              </span>
              <span className="text-xs text-muted-foreground">
                Bài viết: {comment.postId.title}
              </span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const commentActions = (comment: Comment) => (
    <div className="flex items-center gap-2">
      {!comment.status && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleApproveComment(comment._id)}
        >
          <Check className="h-4 w-4 text-green-500" />
        </Button>
      )}
      
      {comment.status && (
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => handleRejectComment(comment._id)}
        >
          <X className="h-4 w-4 text-orange-500" />
        </Button>
      )}
      
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => {
          if (confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) {
            handleDeleteComment(comment._id);
          }
        }}
      >
        <Trash className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý bình luận</h1>
          <p className="text-muted-foreground">Xem và quản lý bình luận trên blog của bạn</p>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh sách bình luận</CardTitle>
          <CardDescription>
            Xem và duyệt tất cả bình luận từ người dùng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm bình luận..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2 whitespace-nowrap">
                <Filter className="h-4 w-4" />
                Lọc bình luận
              </Button>
            </div>
            
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">Tất cả ({comments.length})</TabsTrigger>
                <TabsTrigger value="approved">
                  Đã duyệt ({comments.filter(c => c.status === true).length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Chờ duyệt ({comments.filter(c => c.status === false).length})
                </TabsTrigger>
                <TabsTrigger value="reported">
                  Báo cáo ({comments.filter(c => c.isReported === true).length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredComments}
              actions={commentActions}
            />
          )}
          
          {!loading && filteredComments.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">Không tìm thấy bình luận</h3>
              <p className="text-muted-foreground mt-1">
                Không có bình luận nào khớp với bộ lọc hiện tại
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setActiveTab('all');
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
