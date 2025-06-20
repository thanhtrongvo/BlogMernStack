import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Trash, 
  MessageSquare,
  Loader2
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { DataTable } from '@/shared/components/ui/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Avatar } from '@/shared/components/ui/avatar';
import { useToast } from '@/shared/components/ui/use-toast';
import { commentsAPI } from '@/shared/services/api';
import { format } from 'date-fns';
import { type ApiComment } from '@/shared/types';

export function CommentsPage() {
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await commentsAPI.getAllComments();
      setComments(data as ApiComment[]);
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
  
  // Filter comments based on search term
  const filteredComments = comments.filter(comment => {
    // Safe author name extraction with null checking
    const authorName = comment.author.name;
    // Safe post title extraction with null checking  
    const postTitle = !comment.postId 
      ? 'Không xác định' 
      : typeof comment.postId === 'string' 
        ? 'Không xác định' 
        : comment.postId.title || 'Không xác định';
    
    const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          postTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Table columns definition
  const columns = [
    {
      title: 'Nội dung',
      field: 'content' as keyof ApiComment,
      render: (value: string, comment: ApiComment) => {
        // Safe author name extraction with null checking
        const authorName = comment.author.name || 'Không xác định';
        
        // Safe post title extraction with null checking
        const postTitle = !comment.postId 
          ? 'Không xác định' 
          : typeof comment.postId === 'string' 
            ? 'Không xác định' 
            : comment.postId.title || 'Không xác định';
        
        return (
          <div className="flex items-start gap-3">
            <Avatar
              name={authorName}
              useReactAvatar={true}
              avatarSize="36"
              avatarColor="#4F46E5"
              avatarFgColor="#FFFFFF"
            />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{authorName}</p>
              </div>
              <p className="text-sm mt-1 line-clamp-2">{value}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm')}
                </span>
                <span className="text-xs text-muted-foreground">
                  Bài viết: {postTitle}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
  ];

  const commentActions = (comment: ApiComment) => (
    <div className="flex items-center gap-2">
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
            Xem và quản lý tất cả bình luận từ người dùng
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
