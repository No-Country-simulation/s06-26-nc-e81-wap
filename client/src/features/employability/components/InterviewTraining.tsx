
import { useTranslation } from 'react-i18next';
import type { Training } from '../hooks/useEmployability';
import './InterviewTraining.css';

interface InterviewTrainingProps {
  trainings: Training[];
}

export function InterviewTraining({ trainings }: InterviewTrainingProps) {
  const { t } = useTranslation();

  return (
    <section className="training-section">
      <div className="training-header">
        <div>
          <h3 className="training-title">{t('employability.training.title')}</h3>
          <p className="training-subtitle">{t('employability.training.subtitle')}</p>
        </div>
        <button className="explore-btn">
          {t('employability.training.explore')}
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
      <div className="training-grid">
        {trainings.map((training) => (
          <div key={training.id} className="training-card group">
            <div className="training-image-container">
              <img src={training.image} alt={training.title} className="training-image" />
              {training.tag && <div className="training-tag">{training.tag}</div>}
            </div>
            <div className="training-content">
              <h4 className="training-card-title">{training.title}</h4>
              <p className="training-card-description">{training.description}</p>
              <div className="training-card-footer">
                <span className="training-meta">{training.duration} • {training.level}</span>
                <button className="training-play">
                  <span className="material-symbols-outlined">play_circle</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}