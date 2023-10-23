import {
  ElementRef,
  FC,
  ReactNode,
  RefObject,
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import { useComposedRefs } from '@radix-ui/react-compose-refs';
import { createContext } from '@radix-ui/react-context';
import { useCallbackRef } from '@radix-ui/react-use-callback-ref';
import { composeEventHandlers } from '@radix-ui/primitive';
import smoothscroll from 'smoothscroll-polyfill';
import {debounce} from "../../utils/debounce";
import Box from "./Box";
import {Button} from "./index";
import {styled} from "../../stitches.config";
import {CSS} from "@stitches/react";

type CarouselCompProps = {
  as?: any
  onClick?: any
  children?: ReactNode
  onPointerDown?: any
  onPointerUp?: any
  onMouseDownCapture?: any
  tabIndex?: number
  css?: CSS
}

const [CarouselProvider, useCarouselContext] = createContext<{
  _: any;
  slideListRef: RefObject<HTMLElement>;
  onNextClick(): void;
  onPrevClick(): void;
  nextDisabled: boolean;
  prevDisabled: boolean;
}>('Carousel');

export const Carousel: FC<CarouselCompProps> = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { children, ...carouselProps } = props;
  const slideListRef = useRef<HTMLElement>(null);
  const [_, force] = useState({});
  const [nextDisabled, setNextDisabled] = useState(false);
  const [prevDisabled, setPrevDisabled] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const navigationUpdateDelay = useRef(100);
  useEffect(() => smoothscroll.polyfill(), []);

  const getSlideInDirection = useCallbackRef((direction: 1 | -1) => {
    const slides = ref.current?.querySelectorAll<HTMLElement>('[data-slide-intersection-ratio]');
    if (slides) {
      const slidesArray = Array.from(slides.values());

      if (direction === 1) {
        slidesArray.reverse();
      }

      return slidesArray.find((slide) => slide.dataset.slideIntersectionRatio !== '0');
    }
  });

  const handleNextClick = useCallback(() => {
    const nextSlide = getSlideInDirection(1);

    if (nextSlide && slideListRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = slideListRef.current;
      const itemWidth = nextSlide.clientWidth;
      const itemsToScroll = itemWidth * 2.5 < document.documentElement.offsetWidth ? 2 : 1;
      const nextPos = Math.floor(scrollLeft / itemWidth) * itemWidth + itemWidth * itemsToScroll;
      slideListRef.current.scrollTo({ left: nextPos, behavior: 'smooth' });

      // Disable previous & next buttons immediately
      setPrevDisabled(nextPos <= 0);
      setNextDisabled(scrollWidth - nextPos - clientWidth <= 0);
      // Wait for scroll animation to finish before the buttons *might* show up again
      navigationUpdateDelay.current = 500;
    }
  }, [getSlideInDirection, setPrevDisabled, slideListRef]);

  const handlePrevClick = useCallback(() => {
    const prevSlide = getSlideInDirection(-1);
    if (prevSlide && slideListRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = slideListRef.current;
      const itemWidth = prevSlide.clientWidth;
      const itemsToScroll = itemWidth * 2.5 < document.documentElement.offsetWidth ? 2 : 1;
      const nextPos = Math.ceil(scrollLeft / itemWidth) * itemWidth - itemWidth * itemsToScroll;
      slideListRef.current.scrollTo({ left: nextPos, behavior: 'smooth' });

      // Disable previous & next buttons immediately
      setPrevDisabled(nextPos <= 0);
      setNextDisabled(scrollWidth - nextPos - clientWidth <= 0);
      // Wait for scroll animation to finish before the buttons *might* show up again
      navigationUpdateDelay.current = 500;
    }
  }, [getSlideInDirection, setPrevDisabled, slideListRef]);

  useEffect(() => {
    // Keep checking for whether we need to disable the navigation buttons, debounced
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        if (slideListRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = slideListRef.current;
          setPrevDisabled(scrollLeft <= 0);
          setNextDisabled(scrollWidth - scrollLeft - clientWidth <= 0);
          navigationUpdateDelay.current = 100;
        }
      });
    }, navigationUpdateDelay.current);
  });

  useEffect(() => {
    const slidesList = slideListRef.current;
    if (slidesList) {
      const handleScrollStartAndEnd = debounce(() => force({}), 100, {
        leading: true,
        trailing: true,
      });
      slidesList.addEventListener('scroll', handleScrollStartAndEnd);
      window.addEventListener('resize', handleScrollStartAndEnd);
      force({});
      return () => {
        slidesList.removeEventListener('scroll', handleScrollStartAndEnd);
        window.removeEventListener('resize', handleScrollStartAndEnd);
      };
    }
  }, [slideListRef]);

  return (
    <CarouselProvider
      _={_}
      nextDisabled={nextDisabled}
      prevDisabled={prevDisabled}
      slideListRef={slideListRef}
      onNextClick={handleNextClick}
      onPrevClick={handlePrevClick}
    >
      <div {...carouselProps} ref={ref}>
        {children}
      </div>
    </CarouselProvider>
  );
};

type DragPos = {
  scrollX: number
  pointerX: number
}

export const CarouselSlideList: FC<CarouselCompProps> = (props) => {
  const context = useCarouselContext('CarouselSlideList');
  const ref = useRef<ElementRef<'div'>>(null);
  const composedRefs = useComposedRefs(ref, context.slideListRef);
  const [dragStart, setDragStart] = useState<DragPos | null>(null);

  const handleMouseMove = useCallbackRef((event) => {
    if (ref.current) {
      const distanceX = event.clientX - (dragStart?.pointerX || 0);
      ref.current.scrollLeft = (dragStart?.scrollX || 0) - distanceX;
    }
  });

  const handleMouseUp = useCallbackRef(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    setDragStart(null);
  });

  return (
    <Box
      {...props}
      ref={composedRefs}
      data-state={dragStart ? 'dragging' : undefined}
      onMouseDownCapture={composeEventHandlers(props.onMouseDownCapture, (event: MouseEvent) => {
        if (event.target instanceof HTMLInputElement) {
          return;
        }

        // Drag only if main mouse button was clicked
        if (event.button === 0) {
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
          setDragStart({
            scrollX: (event.currentTarget as HTMLElement).scrollLeft,
            pointerX: event.clientX,
          });
        }
      })}
      onPointerDown={composeEventHandlers(props.onPointerDown, (event: PointerEvent) => {
        if (event.target instanceof HTMLInputElement) {
          return;
        }

        const element = event.target as HTMLElement;
        element.style.userSelect = 'none';
        element.setPointerCapture(event.pointerId);
      })}
      onPointerUp={composeEventHandlers(props.onPointerUp, (event: PointerEvent) => {
        if (event.target instanceof HTMLInputElement) {
          return;
        }

        const element = event.target as HTMLElement;
        element.style.userSelect = '';
        element.releasePointerCapture(event.pointerId);
      })}
    />
  );
};

export const CarouselSlide: FC<CarouselCompProps> = (props) => {
  const { as: Comp = Box, onClick, ...slideProps } = props;
  const context = useCarouselContext('CarouselSlide');
  const ref = useRef<HTMLDivElement>(null);
  const [intersectionRatio, setIntersectionRatio] = useState(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (!ref.current) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIntersectionRatio(entry.intersectionRatio),
      { root: context.slideListRef.current, threshold: [0, 0.5, 1] }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [context.slideListRef, ref]);

  return (
    <Comp
      {...slideProps}
      ref={ref}
      data-slide-intersection-ratio={intersectionRatio}
      onDragStart={(event: DragEvent) => {
        event.preventDefault();
        isDraggingRef.current = true;
      }}
      onClick={(event: SyntheticEvent) => {
        if (isDraggingRef.current) {
          event.preventDefault();
        }
        onClick?.();
      }}
    />
  );
};

export const CarouselNext: FC<CarouselCompProps> = (props) => {
  const { as: Comp = Button, ...nextProps } = props;
  const context = useCarouselContext('CarouselNext');
  return (
    <Comp {...nextProps} onClick={() => context.onNextClick()} disabled={context.nextDisabled} />
  );
};

export const CarouselPrevious: FC<CarouselCompProps> = (props) => {
  const { as: Comp = Button, ...prevProps } = props;
  const context = useCarouselContext('CarouselPrevious');
  return (
    <Comp {...prevProps} onClick={() => context.onPrevClick()} disabled={context.prevDisabled} />
  );
};

export const CarouselArrowButton = styled('button', {
  unset: 'all',
  outline: 0,
  margin: 0,
  border: 0,
  padding: 0,

  display: 'flex',
  position: 'relative',
  zIndex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '$panelBg',
  borderRadius: '100%',
  width: '$8',
  height: '$8',
  color: '$gray12',

  boxShadow: '$blackA7 0px 2px 12px -5px, $blackA2 0px 1px 3px',
  willChange: 'transform, box-shadow, opacity',
  transition: 'all 100ms',

  '@media (hover: hover)': {
    '&:hover': {
      boxShadow: '$blackA6 0px 3px 16px -5px, $blackA2 0px 1px 3px',

      // Fix a bug when hovering at button edges would cause the button to jitter because of transform
      '&::before': {
        content: '',
        inset: -2,
        borderRadius: '100%',
        position: 'absolute',
      },
    },
  },
  '&:focus-visible:not(:active)': {
    boxShadow: '$blackA7 0px 2px 12px -5px, $blackA2 0px 1px 3px',
    outline: '2px solid $pink11',
  },
  '&:active': {
    transform: 'translateY(1px)',
    boxShadow: '$blackA7 0px 2px 10px -5px, $blackA2 0px 1px 3px',
    transition: 'opacity 100ms',
  },
  '&:disabled': {
    opacity: 0,
  },
  '@media (hover: none) and (pointer: coarse)': {
    display: 'none',
  },
});
