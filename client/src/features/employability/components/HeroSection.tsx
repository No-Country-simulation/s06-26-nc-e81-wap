import { useTranslation } from 'react-i18next';
import './HeroSection.css';

interface HeroSectionProps {
  readinessScore: number;
  profileStrength: number;
}

export function HeroSection({ readinessScore, profileStrength }: HeroSectionProps) {
  const { t } = useTranslation();

  return (
    <section className="employability-hero">
      <div className="hero-main">
        <div className="hero-content">
          <h2 className="hero-title">{t('employability.hero.title')}</h2>
          <p className="hero-description">
            {t('employability.hero.description')}
          </p>
          <div className="hero-actions">
            <button className="btn-primary">{t('employability.hero.mockInterview')}</button>
            <button className="btn-secondary">{t('employability.hero.uploadResume')}</button>
          </div>
        </div>
        <div className="hero-decoration"></div>
      </div>

      <div className="hero-stats">
        <div>
          <div className="stats-header">
            <span className="material-symbols-outlined">trending_up</span>
            <span className="stats-label">{t('employability.hero.readinessScore')}</span>
          </div>
          <div className="stats-score">{readinessScore}%</div>
        </div>
        <div className="stats-progress">
          <div className="stats-progress-header">
            <span>{t('employability.hero.profileStrength')}</span>
            <span>{profileStrength}/100</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${profileStrength}%` }}></div>
          </div>
        </div>
      </div>
    </section>
  );
}