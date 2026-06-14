import { HeroSection } from './components/HeroSection';
import { CourseCatalog } from './components/CourseCatalog';
import { StudyMaterials } from './components/StudyMaterials';
import './TrainingPage.css';

export const TrainingPage = () => {
  return (
    <div className="training-page">
      <div className="training-content">
        <HeroSection />
        <CourseCatalog />
        <StudyMaterials />
      </div>
    </div>
  );
};