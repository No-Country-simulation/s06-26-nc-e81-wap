
import { useTranslation } from 'react-i18next';
import type { Mentor } from '../hooks/useEmployability';
import './MentorshipSection.css';

interface MentorshipSectionProps {
  mentors: Mentor[];
}

export function MentorshipSection({ mentors }: MentorshipSectionProps) {
  const { t } = useTranslation();
  const onlineMentors = mentors.filter(m => m.online);

  return (
    <section className="mentorship-section">
      <div className="mentorship-content">
        <div>
          <h2 className="mentorship-title">{t('employability.mentorship.title')}</h2>
          <p className="mentorship-description">
            {t('employability.mentorship.description')}
          </p>
          <div className="mentorship-avatars">
            <div className="avatar-group">
              {mentors.slice(0, 4).map((mentor) => (
                <img 
                  key={mentor.id}
                  src={mentor.avatar} 
                  alt={mentor.name} 
                  className="mentor-avatar" 
                />
              ))}
            </div>
            <div className="online-status">
              <span className="online-dot"></span>
              <span className="online-text">
                {t('employability.mentorship.online', { count: onlineMentors.length })}
              </span>
            </div>
          </div>
        </div>
        <div className="mentorship-sidebar">
          <div className="sidebar-item">
            <div className="sidebar-icon">
              <span className="material-symbols-outlined">forum</span>
            </div>
            <div>
              <p className="sidebar-item-title">{t('employability.mentorship.communityBoard')}</p>
              <p className="sidebar-item-subtitle">{t('employability.mentorship.nextSession')}</p>
            </div>
          </div>
          <div className="sidebar-item">
            <div className="sidebar-icon">
              <span className="material-symbols-outlined">diversity_3</span>
            </div>
            <div>
              <p className="sidebar-item-title">{t('employability.mentorship.referralNetwork')}</p>
              <p className="sidebar-item-subtitle">{t('employability.mentorship.newOpenings')}</p>
            </div>
          </div>
          <button className="mentorship-join-btn">
            {t('employability.mentorship.joinNetwork')}
          </button>
        </div>
      </div>
      <div className="mentorship-decoration"></div>
    </section>
  );
}