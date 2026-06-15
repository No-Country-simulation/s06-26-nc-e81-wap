import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Course } from '../types/training.types';
import './CourseCard.css';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { t } = useTranslation();

  return (
    <div className="course-card group">
      <div className="card-image-container">
        <img src={course.image} alt={course.title} className="card-image" />
        <div className="card-tag">{course.tag}</div>
      </div>
      <div className="card-content">
        <h4 className="card-title">{course.title}</h4>
        <p className="card-description">{course.description}</p>
        <div className="card-footer">
          {course.hasInstructors ? (
            <div className="instructors">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7fvCPIn4BjPBvdRWRQtpC7aa-_TXR5xps8BBSCWCGADIeZVx02BSX1MiC1_dEmJOQ5NbI_t6ut91sCKxaKSQJfDuX9sy3AneEqdqyTOhEnInLWizk0-fLTn9EhZYTyZOq81DXJSsia7b8A_Li0a_mKWVkbtLY9mNv6dArG0EzBHSRVF2A1aChiUA40tADOH3MqVDQXU58jDiFh3uV4iXhDGkLGCs5axV04-DlcJkBClBcNj3HDP1FG4M78DDvsHS77UsZIH4y64eb"
                alt="Instructor"
                className="instructor-avatar"
              />
              <div className="more-instructors">+12</div>
            </div>
          ) : course.beginnerFriendly ? (
            <span className="beginner-badge">{t('training.beginnerFriendly')}</span>
          ) : course.rating ? (
            <div className="rating">
              {[...Array(course.rating)].map((_, i) => (
                <span key={i} className="material-symbols-outlined star-filled">star</span>
              ))}
            </div>
          ) : null}
          <span className="duration">{course.duration}</span>
        </div>
      </div>
    </div>
  );
};