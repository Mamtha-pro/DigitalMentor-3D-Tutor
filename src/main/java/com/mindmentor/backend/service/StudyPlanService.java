package com.mindmentor.backend.service;

import com.mindmentor.backend.dto.studyplan.CreateStudyPlanRequest;
import com.mindmentor.backend.dto.studyplan.UpdateTaskRequest;
import com.mindmentor.backend.entity.StudyPlan;
import com.mindmentor.backend.exception.ApiException;
import com.mindmentor.backend.repository.StudyPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudyPlanService {

    private static final int WEEKS = 4;
    private static final String[] DAY_NAMES = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"};

    private final StudyPlanRepository studyPlanRepository;

    public List<StudyPlan> listPlans(String userId) {
        return studyPlanRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public StudyPlan createPlan(String userId, CreateStudyPlanRequest request) {
        StudyPlan plan = StudyPlan.builder()
                .userId(userId)
                .overview(StudyPlan.Overview.builder()
                        .subject(request.getSubject().trim())
                        .duration(WEEKS + " weeks")
                        .examDate(request.getExamDate())
                        .build())
                .weeklyPlans(generateWeeklyPlans(request.getSubject().trim()))
                .recommendations(defaultRecommendations())
                .isActive(true)
                .progress(0)
                .build();

        return studyPlanRepository.save(plan);
    }

    public StudyPlan updateTask(String userId, String planId, UpdateTaskRequest request) {
        StudyPlan plan = studyPlanRepository.findByIdAndUserId(planId, userId)
                .orElseThrow(() -> ApiException.notFound("Study plan not found"));

        StudyPlan.WeeklyPlan week = getOrThrow(plan.getWeeklyPlans(), request.getWeekIndex(), "week");
        StudyPlan.DailyTask day = getOrThrow(week.getDailyTasks(), request.getDayIndex(), "day");
        StudyPlan.TaskItem task = getOrThrow(day.getTasks(), request.getTaskIndex(), "task");

        task.setCompleted(Boolean.TRUE.equals(request.getCompleted()));

        plan.setProgress(calculateProgress(plan));

        return studyPlanRepository.save(plan);
    }

    public void deletePlan(String userId, String planId) {
        StudyPlan plan = studyPlanRepository.findByIdAndUserId(planId, userId)
                .orElseThrow(() -> ApiException.notFound("Study plan not found"));

        studyPlanRepository.delete(plan);
    }

    private <T> T getOrThrow(List<T> list, Integer index, String label) {
        if (index == null || index < 0 || index >= list.size()) {
            throw ApiException.badRequest("Invalid " + label + "Index");
        }
        return list.get(index);
    }

    private int calculateProgress(StudyPlan plan) {
        int total = 0;
        int completed = 0;

        for (StudyPlan.WeeklyPlan week : plan.getWeeklyPlans()) {
            for (StudyPlan.DailyTask day : week.getDailyTasks()) {
                for (StudyPlan.TaskItem task : day.getTasks()) {
                    total++;
                    if (task.isCompleted()) {
                        completed++;
                    }
                }
            }
        }

        return total == 0 ? 0 : (int) Math.round((completed * 100.0) / total);
    }

    private List<StudyPlan.WeeklyPlan> generateWeeklyPlans(String subject) {
        List<StudyPlan.WeeklyPlan> weeks = new ArrayList<>();

        String[] focusByWeek = {
                "Understand the fundamentals of " + subject,
                "Build intermediate knowledge of " + subject,
                "Apply " + subject + " to practice problems",
                "Revise and consolidate " + subject + " before the exam"
        };

        for (int w = 0; w < WEEKS; w++) {
            List<StudyPlan.DailyTask> dailyTasks = new ArrayList<>();

            for (int d = 0; d < DAY_NAMES.length; d++) {
                List<StudyPlan.TaskItem> tasks = new ArrayList<>();
                tasks.add(StudyPlan.TaskItem.builder()
                        .text("Study " + subject + " - " + focusByWeek[w])
                        .completed(false)
                        .build());
                tasks.add(StudyPlan.TaskItem.builder()
                        .text("Practice questions and review notes")
                        .completed(false)
                        .build());

                dailyTasks.add(StudyPlan.DailyTask.builder()
                        .day(DAY_NAMES[d])
                        .duration("60 minutes")
                        .tasks(tasks)
                        .build());
            }

            weeks.add(StudyPlan.WeeklyPlan.builder()
                    .week("Week " + (w + 1))
                    .goals(List.of(focusByWeek[w]))
                    .dailyTasks(dailyTasks)
                    .build());
        }

        return weeks;
    }

    private List<String> defaultRecommendations() {
        return List.of(
                "Study consistently every day.",
                "Take short breaks between focus sessions.",
                "Review completed topics weekly to reinforce memory.",
                "Use active recall and practice tests before the exam."
        );
    }
}
