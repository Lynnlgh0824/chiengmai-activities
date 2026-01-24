import React from 'react'
import { weeklyScheduleData, dayNames } from '../data/weeklySchedule'
import './WeeklyCalendarView.css'

function WeeklyCalendarView({ activities = [], loading }) {
  // 如果没有传入活动，使用模拟的周课表数据
  const scheduleData = activities.length > 0 ? groupActivitiesByWeek(activities) : weeklyScheduleData

  // 将传入的活动按周分组
  function groupActivitiesByWeek(activities) {
    const weeks = []
    const activitiesByDate = {}

    // 按日期分组
    activities.forEach(activity => {
      const date = new Date(activity.date)
      const dateStr = date.toISOString().split('T')[0]
      if (!activitiesByDate[dateStr]) {
        activitiesByDate[dateStr] = []
      }
      activitiesByDate[dateStr].push(activity)
    })

    // 转换为周格式
    let currentWeek = {
      week: '活动列表',
      startDate: new Date(Math.min(...activities.map(a => new Date(a.date)))).toISOString().split('T')[0],
      endDate: new Date(Math.max(...activities.map(a => new Date(a.date)))).toISOString().split('T')[0],
      activities: activities.map(a => ({
        ...a,
        dayOfWeek: new Date(a.date).getDay()
      }))
    }

    weeks.push(currentWeek)
    return weeks
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

  return (
    <div className="weekly-calendar-view">
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      ) : scheduleData.length === 0 ? (
        <div className="no-activities">
          <p>暂无活动安排</p>
        </div>
      ) : (
        <div className="weeks-container">
          {scheduleData.map((week, weekIndex) => (
            <div key={weekIndex} className="week-card">
              <div className="week-header">
                <h3 className="week-title">{week.week}</h3>
                <span className="week-date-range">
                  {week.startDate} ~ {week.endDate}
                </span>
              </div>

              <div className="calendar-grid">
                {/* 星期表头 */}
                {dayNames.map(day => (
                  <div key={day} className="calendar-day-header">{day}</div>
                ))}

                {/* 周一到周日的活动格子 */}
                {[1, 2, 3, 4, 5, 6, 0].map(dayIndex => {
                  const dayActivities = week.activities.filter(a => a.dayOfWeek === dayIndex)
                  const dayName = dayNames[dayIndex]
                  const displayDate = getDisplayDate(week, dayIndex)

                  return (
                    <div key={dayIndex} className={`calendar-day ${dayActivities.length > 0 ? 'has-activity' : ''}`}>
                      <div className="day-number">{displayDate}</div>
                      <div className="day-activities">
                        {dayActivities.map(activity => (
                          <div
                            key={activity.id}
                            className="activity-card-mini"
                            onClick={() => window.open(activity.source?.url || '#', '_blank')}
                            style={{ borderLeftColor: getCategoryColor(activity.category) }}
                          >
                            <div className="activity-time">{activity.time}</div>
                            <div className="activity-title">{activity.title}</div>
                            <div className="activity-location">📍 {activity.location}</div>
                            <div className="activity-price">{activity.price}</div>
                            {activity.enrolled && activity.capacity && (
                              <div className="activity-enrollment">
                                {activity.enrolled}/{activity.capacity}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// 获取显示的日期
function getDisplayDate(week, dayIndex) {
  const startDate = new Date(week.startDate)
  const targetDate = new Date(startDate)
  targetDate.setDate(startDate.getDate() + dayIndex)
  return targetDate.getDate()
}

export default WeeklyCalendarView
