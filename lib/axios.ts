import { default as axios } from 'axios'
import { createAxiosInstance } from '@/lib/helpers'

export const apiEndpoint = createAxiosInstance(axios)

export const apiAlumni = apiEndpoint.alumni

export const apiAnalytic = apiEndpoint.analytic

export const apiAssessment = apiEndpoint.assessment

export const apiAssessmentCBT = apiEndpoint.assessmentCbt

export const apiAssessments = apiEndpoint.assessments

export const apiCourses = apiEndpoint.courses

export const apiEvaluation = apiEndpoint.evaluation

export const apiInventory = apiEndpoint.inventory

export const apiNews = apiEndpoint.news

export const apiNotification = apiEndpoint.notification

export const apiProfile = apiEndpoint.profile

export const apiRBAC = apiEndpoint.rbac

export const apiSchedule = apiEndpoint.schedule

export const apiScheduleTest = apiEndpoint.scheduleTest

export const apiQuestionBank = apiEndpoint.questionBank

export const apiIntegration = apiEndpoint.integrattion
