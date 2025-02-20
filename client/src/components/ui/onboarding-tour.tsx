import { useState, useEffect } from 'react';
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';
import { useAuth } from '@/hooks/use-auth';

const steps = [
  {
    target: 'body',
    content: 'Welcome to AI Tools App Store! Let us show you around.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.search-bar',
    content: 'Search for AI tools by name or description, and filter by professional categories.',
    placement: 'bottom',
  },
  {
    target: '.tools-grid',
    content: 'Browse through our collection of AI tools. Each card shows key information about the tool.',
    placement: 'top',
  },
  {
    target: '.tool-card',
    content: 'Click on any tool to view more details and try it out!',
    placement: 'right',
  },
  {
    target: '.user-menu',
    content: 'Access your profile, view your favorite tools, and manage your account here.',
    placement: 'bottom',
  },
];

export function OnboardingTour() {
  const [run, setRun] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if this is the user's first visit
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour && user) {
      setRun(true);
    }
  }, [user]);

  const handleJoyrideCallback = (data: { status?: string; action?: string; }) => {
    const { status, action } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRun(false);
      localStorage.setItem('hasSeenTour', 'true');
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          backgroundColor: 'hsl(var(--background))',
          textColor: 'hsl(var(--foreground))',
          arrowColor: 'hsl(var(--background))',
        },
      }}
      callback={handleJoyrideCallback}
    />
  );
}