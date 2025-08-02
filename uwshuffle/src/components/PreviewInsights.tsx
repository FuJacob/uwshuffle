import React from "react";
import {
  FiCheckCircle,
  FiBook,
  FiUsers,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiMessageSquare,
  FiBarChart2,
} from "react-icons/fi";
import type { Course } from "../types";
import uwflowIcon from "../assets/uwflow.png";

interface ProfInfo {
  name: string;
  rating: {
    liked: number;
    engaging: number;
    clear: number;
    comment_count: number;
    filled_count: number;
  };
}

interface PreviewInsightsProps {
  previewCourse: Course | null;
  profInfo: ProfInfo | null;
}

const PreviewInsights: React.FC<PreviewInsightsProps> = ({
  previewCourse,
  profInfo,
}) => {
  if (!previewCourse) {
    return (
      <div className="uwshuffle-stats-section">
        <div className="uwshuffle-stats-title">Preview Insights</div>
        <div className="uwshuffle-stats-content">
          <div className="uwshuffle-no-preview">
            <div className="uwshuffle-no-preview-text">
              No course selected for preview
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="uwshuffle-stats-section">
      <div className="uwshuffle-stats-title">Preview Insights</div>
      <div className="uwshuffle-stats-content">
        <div className="uwshuffle-preview-containers">
          <div className="uwshuffle-course-container">
            <div className="uwshuffle-course-info-container">
              <div className="uwshuffle-course-info-title">
                <span className="uwshuffle-icon">
                  <FiCheckCircle />
                </span>
                Course Info:
              </div>
              <div className="uwshuffle-course-details">
                <div className="uwshuffle-course-line">
                  <div className="uwshuffle-course-item">
                    <span className="uwshuffle-icon">
                      <FiBook />
                    </span>
                    <span className="uwshuffle-value">
                      {previewCourse.course}
                    </span>
                  </div>
                  <div className="uwshuffle-course-item">
                    <span className="uwshuffle-icon">
                      <FiUsers />
                    </span>
                    <span className="uwshuffle-value">
                      {previewCourse.section}
                    </span>
                  </div>
                </div>
                <div className="uwshuffle-course-line">
                  <div className="uwshuffle-course-item">
                    <span className="uwshuffle-icon">
                      <FiCalendar />
                    </span>
                    <div className="uwshuffle-course-time-info">
                      <div className="uwshuffle-course-days">
                        {previewCourse.days?.join(", ")}
                      </div>
                      <div className="uwshuffle-course-time">
                        {previewCourse.start} - {previewCourse.end}
                      </div>
                    </div>
                  </div>
                  <div className="uwshuffle-course-item">
                    <span className="uwshuffle-icon">
                      <FiMapPin />
                    </span>
                    <span className="uwshuffle-value">
                      {previewCourse.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="uwshuffle-professor-container">
            <div className="uwshuffle-uwflow-header">
              <div className="uwshuffle-uwflow-title">
                <div className="uwshuffle-uwflow-left">
                  <div className="uwshuffle-course-line">
                    <span className="uwshuffle-icon">
                      <FiUser />
                    </span>
                    <span className="uwshuffle-value">
                      {profInfo?.name
                        ? profInfo.name
                        : "No Instructor Selected"}
                    </span>
                  </div>
                </div>
                <div className="uwshuffle-uwflow-right">
                  <a
                    href={
                      profInfo?.name
                        ? `https://uwflow.com/professor/${profInfo.name
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                            .replace(/[^a-z0-9-]/g, "")
                            .replace(/ /g, "-")}`
                        : "https://uwflow.com"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="uwshuffle-professor-link uwshuffle-uwflow-link"
                  >
                    Go to{" "}
                    <img
                      src={uwflowIcon}
                      alt="UW Flow"
                      className="uwshuffle-uwflow-icon"
                    />
                    UW Flow
                  </a>
                </div>
              </div>
            </div>
            <div className="uwshuffle-uwflow-content">
              <div className="uwshuffle-professor-content">
                <div className="uwshuffle-professor-circle">
                  <div className="uwshuffle-professor-score">
                    {profInfo?.rating.liked
                      ? Math.round(profInfo?.rating.liked) + "%"
                      : "~%"}
                  </div>
                </div>
                <div className="uwshuffle-professor-info">
                  <div className="uwshuffle-professor-ratings">
                    <span>
                      Engaging:{" "}
                      {profInfo?.rating.engaging
                        ? Math.round(profInfo?.rating.engaging) + "%"
                        : "~%"}
                    </span>
                    <span>
                      <FiMessageSquare className="uwshuffle-icon" />
                      {profInfo?.rating.comment_count
                        ? profInfo.rating.comment_count
                        : "~"}
                    </span>
                  </div>
                  <div className="uwshuffle-professor-reviews">
                    <span>
                      Clarity:{" "}
                      {profInfo?.rating.clear
                        ? Math.round(profInfo?.rating.clear) + "%"
                        : "~%"}
                    </span>
                    <span>
                      <FiBarChart2 className="uwshuffle-icon" />
                      {profInfo?.rating.filled_count
                        ? profInfo.rating.filled_count
                        : "~"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewInsights;
