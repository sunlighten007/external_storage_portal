import { Suspense } from 'react';
import { getSession } from '@/lib/auth/session';
import { getSpaceBySlug, userHasSpaceAccess } from '@/lib/db/queries/spaces';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, FileText } from 'lucide-react';

interface UploadPageProps {
  params: {
    slug: string;
  };
}

async function UploadForm({ slug }: { slug: string }) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const space = await getSpaceBySlug(slug);
  if (!space) {
    notFound();
  }

  const hasAccess = await userHasSpaceAccess(session.user.id, space.id);
  if (!hasAccess) {
    redirect('/spaces');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/spaces/${slug}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Space
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Upload Files</h1>
          <p className="text-muted-foreground">
            Upload OTA images and related files to {space.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            File Upload
          </CardTitle>
          <CardDescription>
            Select files to upload to your space. Supported formats: ZIP, APK, IMG, and other OTA-related files.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-4">
            {/* File Upload Area */}
            <div className="space-y-2">
              <Label htmlFor="files">Select Files</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label htmlFor="files" className="cursor-pointer">
                    <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      Click to upload
                    </span>
                    <span className="text-sm text-gray-500"> or drag and drop</span>
                  </Label>
                  <Input
                    id="files"
                    type="file"
                    multiple
                    className="hidden"
                    accept=".zip,.apk,.img,.tar,.gz,.7z"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ZIP, APK, IMG, TAR, GZ, 7Z files up to 5GB each
                </p>
              </div>
            </div>

            {/* File Metadata */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="version">Version (Optional)</Label>
                <Input
                  id="version"
                  placeholder="e.g., 1.0.0"
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="md5">MD5 Hash (Optional)</Label>
                <Input
                  id="md5"
                  placeholder="32-character MD5 hash"
                  maxLength={32}
                  pattern="[a-fA-F0-9]{32}"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <textarea
                id="description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Brief description of the files..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="changelog">Changelog (Optional)</Label>
              <textarea
                id="changelog"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="What's new in this version..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" asChild>
                <Link href={`/spaces/${slug}`}>
                  Cancel
                </Link>
              </Button>
              <Button type="submit">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Upload Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Maximum file size: 5GB per file</li>
            <li>Supported formats: ZIP, APK, IMG, TAR, GZ, 7Z</li>
            <li>Files are automatically organized by space</li>
            <li>MD5 hashes are optional but recommended for verification</li>
            <li>Version numbers help track different releases</li>
            <li>Descriptions and changelogs help team members understand changes</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UploadPage({ params }: UploadPageProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    }>
      <UploadForm slug={params.slug} />
    </Suspense>
  );
}
