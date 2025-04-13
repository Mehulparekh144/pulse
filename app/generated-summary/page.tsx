'use client';
import Summary from './Summary';
import Breadcrumbs from './CustomBreadCrumbs';
import { useNavigation } from '@/hooks/use-navigation';
import UploadVideo from './UploadVideo';
import { useSummary } from '@/hooks/use-summary';
export default function GeneratedSummary() {
	const { currentPage } = useNavigation();
	const { summary } = useSummary();

	if (!summary) {
		window.location.href = '/';
	}
	return (
		<div className="w-screen h-screen bg-secondary flex flex-col items-center justify-center px-4">
			<Breadcrumbs className="mb-4" />
			{currentPage === 'summary' && <Summary />}
			{currentPage === 'video' && <UploadVideo />}
		</div>
	);
}
