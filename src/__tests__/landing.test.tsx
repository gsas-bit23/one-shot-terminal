import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';

describe('LandingPage', () => {
  it('renders hero, Launch App CTA and risk disclosure', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /launch app/i })[0].getAttribute('href')).toBe('/pulse');
    expect(screen.getByText(/Risk disclosure/i)).toBeTruthy();
    expect(screen.getAllByText(/Demo/).length).toBeGreaterThan(0);
  });
});
