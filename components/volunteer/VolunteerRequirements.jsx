import { useLanguage } from "@/contexts/language-context"

const VolunteerRequirements = () => {
  const { t } = useLanguage()
  
  return (
    <section className="volunteer-requirements">
      <div className="container">
        <h2>{t("VOLUNTEER_REQUIREMENTS_TITLE", "voluntario")}</h2>

        <div className="requirements-grid">
          <div className="requirement-card">
            <div className="requirement-icon">
              <i className="fas fa-user-clock"></i>
            </div>
            <h3>{t("VOLUNTEER_REQUIREMENT_AGE_TITLE", "voluntario")}</h3>
            <p>{t("VOLUNTEER_REQUIREMENT_AGE", "voluntario")}</p>
          </div>

          <div className="requirement-card">
            <div className="requirement-icon">
              <i className="fas fa-calendar-check"></i>
            </div>
            <h3>{t("VOLUNTEER_REQUIREMENT_COMMITMENT_TITLE", "voluntario")}</h3>
            <p>{t("VOLUNTEER_REQUIREMENT_COMMITMENT", "voluntario")}</p>
          </div>

          <div className="requirement-card">
            <div className="requirement-icon">
              <i className="fas fa-heart"></i>
            </div>
            <h3>{t("VOLUNTEER_REQUIREMENT_LOVE_TITLE", "voluntario")}</h3>
            <p>{t("VOLUNTEER_REQUIREMENT_LOVE", "voluntario")}</p>
          </div>

          <div className="requirement-card">
            <div className="requirement-icon">
              <i className="fas fa-hands-helping"></i>
            </div>
            <h3>{t("VOLUNTEER_REQUIREMENT_TEAM_TITLE", "voluntario")}</h3>
            <p>{t("VOLUNTEER_REQUIREMENT_TEAM", "voluntario")}</p>
          </div>

          <div className="requirement-card">
            <div className="requirement-icon">
              <i className="fas fa-file-signature"></i>
            </div>
            <h3>{t("VOLUNTEER_REQUIREMENT_DOCS_TITLE", "voluntario")}</h3>
            <p>{t("VOLUNTEER_REQUIREMENT_DOCS", "voluntario")}</p>
          </div>

          <div className="requirement-card">
            <div className="requirement-icon">
              <i className="fas fa-book-reader"></i>
            </div>
            <h3>{t("VOLUNTEER_REQUIREMENT_TRAINING_TITLE", "voluntario")}</h3>
            <p>{t("VOLUNTEER_REQUIREMENT_TRAINING", "voluntario")}</p>
          </div>
        </div>

        <div className="process-steps">
          <h3>{t("VOLUNTEER_PROCESS_TITLE", "voluntario")}</h3>
          <ol className="steps-list">
            <li>
              <span className="step-number">1</span>
              <div className="step-content">
                <h4>{t("VOLUNTEER_PROCESS_STEP1_TITLE", "voluntario")}</h4>
                <p>{t("VOLUNTEER_PROCESS_STEP1", "voluntario")}</p>
              </div>
            </li>
            <li>
              <span className="step-number">2</span>
              <div className="step-content">
                <h4>{t("VOLUNTEER_PROCESS_STEP2_TITLE", "voluntario")}</h4>
                <p>{t("VOLUNTEER_PROCESS_STEP2", "voluntario")}</p>
              </div>
            </li>
            <li>
              <span className="step-number">3</span>
              <div className="step-content">
                <h4>{t("VOLUNTEER_PROCESS_STEP3_TITLE", "voluntario")}</h4>
                <p>{t("VOLUNTEER_PROCESS_STEP3", "voluntario")}</p>
              </div>
            </li>
            <li>
              <span className="step-number">4</span>
              <div className="step-content">
                <h4>{t("VOLUNTEER_PROCESS_STEP4_TITLE", "voluntario")}</h4>
                <p>{t("VOLUNTEER_PROCESS_STEP4", "voluntario")}</p>
              </div>
            </li>
            <li>
              <span className="step-number">5</span>
              <div className="step-content">
                <h4>{t("VOLUNTEER_PROCESS_STEP5_TITLE", "voluntario")}</h4>
                <p>{t("VOLUNTEER_PROCESS_STEP5", "voluntario")}</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  )
}

export default VolunteerRequirements