import React, { useState } from "react";
import {
  FiHelpCircle,
  FiBook,
  FiUsers,
  FiClock,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiHash,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import type { Course } from "../types";

import { Tooltip } from "react-tooltip";

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
  const [isPreviewInsightsCollapsed, setIsPreviewInsightsCollapsed] =
    useState<boolean>(false);

  if (!previewCourse) {
    return (
      <div className="uwshuffle-preview-section">
        <div className="uwshuffle-preview-card">
          <div className="uwshuffle-preview-title">
            <div className="uwshuffle-preview-title-content">
              Preview Insights
              <FiHelpCircle
                className="uwshuffle-help-icon"
                data-tooltip-id="preview-insights-tooltip"
                data-tooltip-content="View detailed information about the course you're considering swapping to, including professor ratings from UW Flow and course details."
              />
            </div>
            <button
              onClick={() =>
                setIsPreviewInsightsCollapsed(!isPreviewInsightsCollapsed)
              }
              className="uwshuffle-collapse-button"
            >
              {isPreviewInsightsCollapsed ? <FiChevronUp /> : <FiChevronDown />}
            </button>
          </div>
          {!isPreviewInsightsCollapsed && (
            <div className="uwshuffle-preview-details">
              <div className="uwshuffle-no-preview">
                <div className="uwshuffle-no-preview-text">
                  No course selected for preview
                </div>
              </div>
            </div>
          )}
        </div>
        <Tooltip
          id="preview-insights-tooltip"
          place="top"
          className="uwshuffle-tooltip"
        />
      </div>
    );
  }

  return (
    <div className="uwshuffle-preview-section">
      <div className="uwshuffle-preview-card">
        <div className="uwshuffle-preview-title">
          <div className="uwshuffle-preview-title-content">
            Preview Insights
            <FiHelpCircle
              className="uwshuffle-help-icon"
              data-tooltip-id="preview-insights-tooltip"
              data-tooltip-content="View detailed information about the course you're considering swapping to, including professor ratings and course details."
            />
          </div>
          <button
            onClick={() =>
              setIsPreviewInsightsCollapsed(!isPreviewInsightsCollapsed)
            }
            className="uwshuffle-collapse-button"
          >
            {isPreviewInsightsCollapsed ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>
        {!isPreviewInsightsCollapsed && (
          <div className="uwshuffle-preview-details">
            <div className="uwshuffle-preview-containers">
              <div className="uwshuffle-course-container">
                <div className="uwshuffle-uwflow-header">
                  <div className="uwshuffle-uwflow-title">
                    <div className="uwshuffle-uwflow-left">
                      <div className="uwshuffle-course-line">
                        <span className="uwshuffle-icon">
                          <FiBook />
                        </span>
                        <span
                          className="uwshuffle-value"
                          style={{ fontWeight: "bold" }}
                        >
                          {previewCourse.course}
                        </span>
                      </div>
                    </div>
                    <div className="uwshuffle-uwflow-right">
                      <a
                        href={`https://uwflow.com/course/${previewCourse.course
                          .toLowerCase()
                          .replace(/\s+/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="uwshuffle-professor-link uwshuffle-uwflow-link"
                      >
                        Go to{" "}
                        <img
                          src="/uwflow.png"
                          alt="UW Flow"
                          className="uwshuffle-uwflow-icon"
                        />
                        UW Flow
                      </a>
                    </div>
                  </div>
                </div>
                <div className="uwshuffle-uwflow-content">
                  <div className="uwshuffle-course-details">
                    <div className="uwshuffle-course-line">
                      <div className="uwshuffle-course-item">
                        <span className="uwshuffle-icon">
                          <FiUsers />
                        </span>
                        <span className="uwshuffle-value">
                          {previewCourse.days
                            ?.map((day) => {
                              const dayMap: { [key: string]: string } = {
                                Monday: "Mo",
                                Tuesday: "Tu",
                                Wednesday: "We",
                                Thursday: "Th",
                                Friday: "Fr",
                                Saturday: "Sa",
                                Sunday: "Su",
                              };
                              return dayMap[day] || day;
                            })
                            .join(", ")}
                        </span>
                      </div>
                      <div className="uwshuffle-course-item">
                        <span className="uwshuffle-icon">
                          <FiHash />
                        </span>
                        <span className="uwshuffle-value">
                          {previewCourse.section}
                        </span>
                      </div>
                    </div>
                    <div className="uwshuffle-course-line">
                      <div className="uwshuffle-course-item">
                        <span className="uwshuffle-icon">
                          <FiClock />
                        </span>
                        <span className="uwshuffle-value">
                          {previewCourse.start} - {previewCourse.end}
                        </span>
                      </div>
                      <div className="uwshuffle-course-item">
                        <a
                          href={`https://www.google.com/maps/search/${
                            previewCourse.location?.replace(/\s+/g, "+") +
                              "+UWATERLOO" || "UWATERLOO"
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="uwshuffle-professor-link uwshuffle-uwflow-link"
                        >
                          <img
                            src="/googlemaps.png"
                            alt="Google Maps"
                            className="uwshuffle-googlemaps-icon"
                            style={{
                              marginRight: "2px",
                              width: "8px",
                              height: "auto",
                            }}
                          />
                          {previewCourse.location || "TBA"}
                        </a>
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
                        <span
                          className="uwshuffle-value"
                          style={{ fontWeight: "bold" }}
                        >
                          {profInfo?.name ? profInfo.name : "~"}
                        </span>
                      </div>
                    </div>
                    <div className="uwshuffle-uwflow-right">
                      <a
                        href={
                          profInfo?.name
                            ? `https://uwflow.com/professor/${
                                profInfo.name
                                  .toLowerCase()
                                  .replace(/\s+/g, "_") // spaces to underscores
                                  .replace(/[^a-z0-9_]/g, "") // remove everything except a-z, 0-9, _
                              }`
                            : "https://uwflow.com"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`uwshuffle-professor-link uwshuffle-uwflow-link ${
                          !previewCourse ? "uwshuffle-disabled" : ""
                        }`}
                        style={{
                          opacity: !previewCourse ? 0.5 : 1,
                          cursor: !previewCourse ? "not-allowed" : "pointer",
                          pointerEvents: !previewCourse ? "none" : "auto",
                        }}
                      >
                        Go to{" "}
                        <img
                          src="/uwflow.png"
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
                          ? Math.round(profInfo?.rating.liked * 100) + "%"
                          : "~%"}
                      </div>
                    </div>
                    <div className="uwshuffle-professor-info">
                      <div className="uwshuffle-professor-ratings">
                        <span>
                          Engaging:{" "}
                          {profInfo?.rating.engaging
                            ? Math.round(profInfo?.rating.engaging * 100) + "%"
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
                            ? Math.round(profInfo?.rating.clear * 100) + "%"
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
        )}
        <Tooltip
          id="preview-insights-tooltip"
          place="top"
          className="uwshuffle-tooltip"
        />
      </div>
    </div>
  );
};

export default PreviewInsights;
