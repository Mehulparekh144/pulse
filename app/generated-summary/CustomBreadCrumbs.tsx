'use client';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/hooks/use-navigation';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { navigationItems } from './navigation';

const Breadcrumbs = ({ className }: { className?: string }) => {
	const { currentPage, handleNavigation } = useNavigation();

	return (
		<div className={cn('flex items-center gap-3', className)}>
			{navigationItems.map((item, index) => (
				<span key={item.value} className="flex items-center gap-2">
					<Button
						variant={'link'}
						onClick={() => handleNavigation(item.value)}
						className={`flex items-center ${
							currentPage !== item.value
								? 'text-muted-foreground'
								: 'text-primary'
						}`}
					>
						<item.icon className="h-4 w-4" />
						<span>{item.label}</span>
					</Button>
					{index !== navigationItems.length - 1 && <ChevronRight />}
				</span>
			))}
		</div>
	);
};

export default Breadcrumbs;
