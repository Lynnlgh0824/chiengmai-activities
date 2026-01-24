import React from 'react'
import { weeklyScheduleData, dayNames } from '../data/weeklySchedule'
import './ScheduleListView.css'

function ScheduleListView({ activities = [], loading }) {
  // 如果没有传入活动，使用模拟的周课表数据
  const scheduleData = activities.length > 0 ? activities : flattenWeeklySchedule(weeklyScheduleData)

  // 将周课表数据展平为列表
  function flattenWeeklySchedule(weeks) {
    return weeks.flatMap(week => week.activities)
  }

  const getCategoryColor = (category) => {
    const colors = {
      '瑜伽': '#FF6B6B',
      '冥想': '#4ECDC4',
      '户外探险': '#FFE66D',
      '文化艺术': '#95E1D3',
      '美食体验': '#F38181',
      '其他': '#667eea'
    }
    return colors[category] || '#667eea'
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const options = { weekday: 'long', month: 'short', day: 'numeric' }
    return date.toLocaleDateString('zh-CN', options)
  }

  // 按日期排序
  const sortedActivities = [...scheduleData].sort((a, b) => {
    return new Date(a.date || '2025-01-01') - new Date(b.date || '2025-01-01')
  })

  return (
    <div className="schedule-list-view">
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      ) : sortedActivities.length === 0 ? (
        <div className="no-activities">
          <p>暂无活动安排</p>
        </div>
      ) : (
        <div className="schedule-list">
          {sortedActivities.map(activity => (
            <div key={activity.id} className="schedule-item">
              <div className="date-badge">
                <div className="date-day">
                  {dayNames[new Date(activity.date || '2025-01-01').getDay()]}
                </div>
                <div className="date-number">
                  {new Date(activity.date || '2025-01-01').getDate()}
                </div>
              </div>

              <div className="activity-content">
                <div className="activity-header">
                  <span
                    className="category-tag"
                    style={{ backgroundColor: getCategoryColor(activity.category) }}
                  >
                    {activity.category}
                  </span>
                  {activity.price && (
                    <span className="price-badge">
                      {activity.price}
                    </span>
                  )}
                </div>

                <h3 className="activity-title">{activity.title}</h3>
                <p className="activity-description">{activity.description}</p>

                <div className="activity-meta">
                  <div className="meta-item">
                    <span>📅</span>
                    <span>{formatDate(activity.date || '2025-01-01')}</span>
                  </div>
                  <div className="meta-item">
                    <span>⏰</span>
                    <span>{activity.time}</span>
                  </div>
                  <div className="meta-item">
                    <span>📍</span>
                    <span>{activity.location}</span>
                  </div>
                  {activity.teacher && (
                    <div className="meta-item">
                      <span>👨‍🏫</span>
                      <span>{activity.teacher}</span>
                    </div>
                  )}
                </div>

                {activity.enrolled && activity.capacity && (
                  <div className="enrollment-bar">
                    <div className="enrollment-progress">
                      <div
                        className="enrollment-fill"
                        style={{
                          width: `${(activity.enrolled / activity.capacity) * 100}%`,
                          backgroundColor: getCategoryColor(activity.category)
                        }}
                      ></div>
                    </div>
                    <span className="enrollment-text">
                      已报名 {activity.enrolled}/{activity.capacity}
                    </span>
                  </div>
                )}

                {activity.source?.url && (
                  <button
                    className="join-button"
                    onClick={() => window.open(activity.source.url, '_blank')}
                    style={{ backgroundColor: getCategoryColor(activity.category) }}
                  >
                    了解详情
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ScheduleListView
