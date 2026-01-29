'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Resume } from '@/types/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, FileText, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: resumes, isLoading, isError } = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const response = await apiClient.get<Resume[]>('/resumes');
      return response.data;
    },
  });

  const createResumeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<Resume>('/resumes', { title: 'Untitled Resume' });
      return response.data;
    },
    onSuccess: (newResume) => {
      toast.success('Resume created');
      router.push(`/resumes/${newResume._id}/edit`);
    },
    onError: () => {
        // Error handling via interceptor
    }
  });

  const deleteResumeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/resumes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Resume deleted');
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
        <div className="container mx-auto p-8 flex justify-center text-red-500">
            Failed to load resumes. Please try again.
        </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Resumes</h1>
        <Button onClick={() => createResumeMutation.mutate()} disabled={createResumeMutation.isPending}>
          {createResumeMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Create New
        </Button>
      </div>

      {resumes?.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No resumes found</p>
          <Button variant="outline" onClick={() => createResumeMutation.mutate()}>
            Create your first resume
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes?.map((resume) => (
            <Card key={resume._id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/resumes/${resume._id}/edit`)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-medium truncate pr-4">
                  {resume.title || 'Untitled'}
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Status: <span className="capitalize">{resume.status}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Last updated: {new Date(resume.updatedAt).toLocaleDateString()}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your resume.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteResumeMutation.mutate(resume._id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
