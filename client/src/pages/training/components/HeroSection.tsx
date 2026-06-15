import React from 'react';
import { useTranslation } from 'react-i18next';
import './HeroSection.css';

export const HeroSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="hero-section">
      <div className="hero-card">
        <div className="hero-content">
          <span className="hero-badge">{t('training.currentPath')}</span>
          <h2 className="hero-title">{t('training.courseTitle')}</h2>
          <p className="hero-description">
            {t('training.courseDescription')}
          </p>
        </div>
        <div className="hero-footer">
          <div className="progress-container">
            <div className="progress-header">
              <span className="progress-label">{t('training.completed')} 68%</span>
              <span className="progress-count">12 / 18 {t('training.modules')}</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: '68%' }}></div>
            </div>
          </div>
          <button className="resume-btn">{t('training.resumeLearning')}</button>
        </div>
      </div>

      <div className="stats-card glass-card">
        <h3 className="stats-title">{t('training.learningActivity')}</h3>
        <div className="stats-list">
          <div className="stat-item">
            <div className="stat-icon streak">
              <span className="material-symbols-outlined">local_fire_department</span>
            </div>
            <div>
              <p className="stat-label">{t('training.dailyStreak')}</p>
              <p className="stat-value">14 {t('training.days')}</p>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <div>
              <p className="stat-label">{t('training.timeLearning')}</p>
              <p className="stat-value">32.5 {t('training.hours')}</p>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <span className="material-symbols-outlined">military_tech</span>
            </div>
            <div>
              <p className="stat-label">{t('training.badgesEarned')}</p>
              <p className="stat-value">8</p>
            </div>
          </div>
        </div>
        <button className="stats-link">
          {t('training.viewStats')}
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </section>
  );
};