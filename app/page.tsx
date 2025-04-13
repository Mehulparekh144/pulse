import { SparklesText } from '@/components/magicui/sparkles-text';
import IdeaInput from './(main)/IdeaInput';

export default function Home() {
	return (
		<main className="h-screen max-w-4xl w-screen py-4 mx-auto px-2 flex flex-col gap-4 items-center justify-center">
			<div className="space-y-1.5 text-center w-full">
				<SparklesText>Pulse</SparklesText>
				<p className="text-xs text-muted-foreground">
					Create a TikTok script in seconds
				</p>
			</div>
			<IdeaInput />
		</main>
	);
}
