export type Course = {
  id: number;
  title: string;
  description: string;
  tag: string;
  image: string;
  duration: string;
  hasInstructors?: boolean;
  beginnerFriendly?: boolean;
  rating?: number;
};

export type StudyMaterial = {
  id: number;
  icon: string;
  title: string;
  size: string;
};

export type Workshop = {
  id: number;
  title: string;
  description: string;
  time: string;
  isUpcoming: boolean;
  attendeeCount?: number;
};