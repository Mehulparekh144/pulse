import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import { useVideo } from '@/hooks/use-video';
import { useMutation } from 'convex/react';
import { UploadCloud, X } from 'lucide-react';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

const UploadVideo = () => {
	const { fileUrl, setFileUrl, fileId, setFileId } = useVideo();
	const [isLoading, setIsLoading] = useState(false);
	const generateUploadUrl = useMutation(api.video.generateUploadUrl);
	const deleteVideo = useMutation(api.video.deleteVideo);
	const getVideoUrl = useMutation(api.video.getVideoUrl);
	const {
		getRootProps,
		getInputProps,
		isDragAccept,
		isDragReject,
		isDragActive,
	} = useDropzone({
		accept: { 'video/*': ['.mp4'] },
		onDrop: async (acceptedFiles) => {
			setIsLoading(true);

			const file = acceptedFiles[0];
			const uploadUrl = await generateUploadUrl();

			const response = await fetch(uploadUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'video/mp4',
				},
				body: file,
			});

			const { storageId } = await response.json();

			const url = await getVideoUrl({ storageId });

			setFileUrl(url ?? null);
			setFileId(storageId);
			setTimeout(() => {
				setIsLoading(false);
			}, 2000);
		},
		onDropRejected: (e) => {
			toast.error(e[0].errors[0].message);
		},
		maxFiles: 1,
		maxSize: 1024 * 1024 * 50,
	});

	const handleDelete = () => {
		setFileUrl(null);
		setFileId(null);
		deleteVideo({ storageId: fileId! });
	};

	return (
		<Card className="max-w-4xl w-full">
			<CardHeader>
				<h1 className="text-2xl font-bold">Upload Video</h1>
			</CardHeader>
			<CardContent>
				{fileUrl ? (
					<div className="flex flex-col gap-2 relative">
						<video
							src={fileUrl}
							controls
							className="w-full h-60 bg-muted rounded-md"
						/>
						<Button
							className="absolute -top-2 -right-2"
							variant={'destructive'}
							size={'icon'}
							onClick={handleDelete}
						>
							<X />
						</Button>
					</div>
				) : (
					<div
						className={`w-full h-48 bg-muted
        rounded-md flex flex-col gap-3 cursor-pointer items-center justify-center border border-dashed ${isDragActive ? 'opacity-50' : ''}`}
						{...getRootProps()}
					>
						<input {...getInputProps()} />
						<UploadCloud
							className={`w-10 h-10 text-muted-foreground 
              ${
								isDragAccept || fileUrl
									? 'text-green-500'
									: isDragReject
										? 'text-red-500'
										: isLoading
											? 'animate-pulse'
											: ''
							}`}
						/>
						<p className="text-sm text-muted-foreground text-center">
							{isLoading
								? 'Uploading...'
								: 'Upload any video to generate a summary.'}
							<br />
							<span className="text-xs text-muted-foreground font-semibold">
								Accepts mp4 up to 50mb
							</span>
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default UploadVideo;
