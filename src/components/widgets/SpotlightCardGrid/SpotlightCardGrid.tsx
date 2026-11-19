import { useState } from 'react';
import { LuArrowRight } from 'react-icons/lu';
import { useTheme } from 'styled-components';
import { CardLink, CardsGrid, GridContainer, SlidingShadow } from './SpotlightCardGrid.styles';

export interface SpotlightCardItem {
  id: string;
  title: string;
  path: string;
  icon: React.ReactNode;
  tag: string;
  description: string;
  accentClass?: string;
  accentColor?: string;
}

export interface SpotlightCardGridProps {
  items: readonly SpotlightCardItem[];
  actionLabel?: string;
}

/**
 * Interactive card grid with a spring-physics sliding backdrop highlight that tracks
 * the hovered or focused card index.
 */
export function SpotlightCardGrid({ items, actionLabel = 'Explore' }: SpotlightCardGridProps) {
  const theme = useTheme();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [lastIndex, setLastIndex] = useState<number>(0);

  const fallbackAccent = theme.colors.accent;
  const activeIndex = hoveredIndex !== null ? hoveredIndex : lastIndex;
  const isVisible = hoveredIndex !== null;
  const activeItem = items[activeIndex];
  const activeAccent = activeItem?.accentColor ?? fallbackAccent;

  return (
    <GridContainer className="spotlight-grid-container">
      <CardsGrid
        $count={items.length}
        className="spotlight-cards-grid"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <SlidingShadow
          $activeIndex={activeIndex}
          $count={items.length}
          $visible={isVisible}
          $accentColor={activeAccent}
          className={`pads-sliding-shadow pos-${activeIndex} ${
            isVisible ? 'is-visible' : 'is-hidden'
          }`}
          aria-hidden="true"
          data-testid="spotlight-sliding-shadow"
        />

        {items.map((item, idx) => {
          const itemAccent = item.accentColor ?? fallbackAccent;

          return (
            <CardLink
              key={item.id}
              to={item.path}
              $hovered={hoveredIndex === idx}
              $accentColor={itemAccent}
              className={`spotlight-card ${item.accentClass ?? ''} ${
                hoveredIndex === idx ? 'is-hovered' : ''
              }`.trim()}
              id={`pad-${item.id}`}
              onMouseEnter={() => {
                setHoveredIndex(idx);
                setLastIndex(idx);
              }}
              onFocus={() => {
                setHoveredIndex(idx);
                setLastIndex(idx);
              }}
              onBlur={() => setHoveredIndex(null)}
            >
              <div className="pad-top-tag">{item.tag}</div>

              <div className="pad-icon-wrapper">{item.icon}</div>

              <h2 className="pad-title">{item.title}</h2>

              <p className="pad-desc">{item.description}</p>

              <div className="pad-action">
                <span>{actionLabel}</span>
                <LuArrowRight className="pad-arrow" />
              </div>
            </CardLink>
          );
        })}
      </CardsGrid>
    </GridContainer>
  );
}
