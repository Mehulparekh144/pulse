'use client';
import { Textarea } from '@/components/ui/textarea';
import { useAutoResizeTextarea } from '@/hooks/use-auto-resize-textarea';
import { useEffect } from 'react';
import { useSummary } from '@/hooks/use-summary';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const Summary = () => {
	const { summary, setSummary } = useSummary();
	const { textareaRef, adjustHeight } = useAutoResizeTextarea({
		minHeight: 100,
		maxHeight: 500,
	});

	// Adjust height when summary changes
	useEffect(() => {
		if (summary) {
			adjustHeight();
		}
	}, [summary, adjustHeight]);

	if (!summary) {
		return <div>No summary found</div>;
	}
	return (
		<Card className="max-w-4xl w-full">
			<CardHeader>
				<h1 className="text-2xl font-bold">Review generated summary</h1>
				<p className="text-sm text-muted-foreground">
					Make edits to the summary
				</p>
			</CardHeader>
			<CardContent>
				<Textarea
					className="mt-4"
					value={summary}
					onChange={(e) => {
						setSummary(e.target.value);
						adjustHeight();
					}}
					ref={textareaRef}
				/>
			</CardContent>
		</Card>
	);
};

export default Summary;
