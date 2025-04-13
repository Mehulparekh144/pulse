'use client';
import { useState } from 'react';
import { AIInputWithLoading } from '@/components/ui/ai-input-with-loading';
import { api } from '@/convex/_generated/api';
import { useAction } from 'convex/react';
import { useSummary } from '@/hooks/use-summary';
import { useRouter } from 'next/navigation';

const IdeaInput = () => {
	const { setSummary } = useSummary();
	const [isLoading, setIsLoading] = useState(false);
	const getSummary = useAction(api.reels.getSummary);
	const router = useRouter();

	const handleSubmit = async (value: string) => {
		setIsLoading(true);
		const summary = await getSummary({ topic: value });
		setSummary(summary);
		setIsLoading(false);
		router.push('/generated-summary');
	};

	return (
		<div className="w-full">
			<AIInputWithLoading
				placeholder="Feel the pulse of creativity and share your next big idea..."
				autoAnimate={isLoading}
				onSubmit={handleSubmit}
			/>
		</div>
	);
};

export default IdeaInput;
