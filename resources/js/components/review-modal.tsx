import { Star } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ReviewModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    subtitle: string;
    rating: number;
    onRatingChange: (rating: number) => void;
    reviewText: string;
    onReviewTextChange: (text: string) => void;
    onSubmit: () => void;
    processing?: boolean;
    error?: string;
}

const RATING_LABELS: Record<number, string> = {
    5: 'Excellent',
    4: 'Very good',
    3: 'Good',
    2: 'Fair',
    1: 'Poor',
};

export function ReviewModal({
    open,
    onClose,
    title,
    subtitle,
    rating,
    onRatingChange,
    reviewText,
    onReviewTextChange,
    onSubmit,
    processing = false,
    error,
}: ReviewModalProps) {
    const [hoverIndex, setHoverIndex] = useState(0);

    const activeStars = hoverIndex || rating;

    const handleSubmit = () => {
        if (rating === 0 || reviewText.trim() === '') {
            return;
        }

        onSubmit();
    };

    const resetHover = () => {
        setHoverIndex(0);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) {
                    resetHover();
                    onClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl">{title}</DialogTitle>
                    <DialogDescription>{subtitle}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-2">
                    <div className="flex flex-col items-center gap-3 rounded-2xl bg-brand-soft/60 py-6">
                        <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                    onClick={() => {
                                        onRatingChange(star);
                                        resetHover();
                                    }}
                                    onMouseEnter={() => setHoverIndex(star)}
                                    onMouseLeave={resetHover}
                                    className="cursor-pointer transition-transform duration-150 hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        className={cn(
                                            'size-8 transition-colors duration-150',
                                            star <= activeStars
                                                ? 'text-brand fill-brand'
                                                : 'text-slate-400',
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                        <p
                            className={cn(
                                'text-sm font-medium',
                                rating > 0 ? 'text-brand' : 'text-muted-foreground',
                            )}
                        >
                            {rating > 0
                                ? RATING_LABELS[rating] ?? `${rating} star${rating > 1 ? 's' : ''}`
                                : 'Select a rating'}
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="review_text">Your review</Label>
                        <Textarea
                            id="review_text"
                            value={reviewText}
                            onChange={(e) => onReviewTextChange(e.target.value)}
                            placeholder="Share what went well or what could be improved..."
                            rows={4}
                            className="resize-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={processing || rating === 0 || reviewText.trim() === ''}
                        className="bg-brand text-white hover:bg-brand/90"
                    >
                        {processing ? 'Submitting...' : 'Submit Review'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}