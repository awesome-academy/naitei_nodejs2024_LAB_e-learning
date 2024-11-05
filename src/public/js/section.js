function showSectionCreateForm() {
    $('#createSectionModal').removeClass('hidden');
}

function hideSectionCreateForm() {
    $('#createSectionModal').addClass('hidden');
}

function removeSectionForm(button) {
    $(button).closest('.section-form').remove();
}

function showSectionEditForm(id, sectionName, totalTime, totalLessons, courseId) {
    $('#edit-section-id').val(id);
    $('#edit-section-name').val(sectionName);
    $('#edit-total-time').val(totalTime);
    $('#edit-total-lessons').val(totalLessons);
    $('#edit-courseId').val(courseId);
    $('#editSectionModal').removeClass('hidden');
}

function hideSectionEditForm() {
    $('#editSectionModal').addClass('hidden');
}

function showCreateForm() {
    $('#createModal').removeClass('hidden');
}

function hideCreateForm() {
    $('#createModal').addClass('hidden');
}

function showEditForm(id, name, categoryId, description, price, rating) {
    $('#edit-id').val(id);
    $('#edit-name').val(name || '');
    $('#edit-description').val(description || '');
    $('#edit-categoryId').val(categoryId || '');
    $('#edit-price').val(price || 0);
    $('#edit-average_rating').val(rating || 0);
    $('#editModal').removeClass('hidden');
}

function hideEditForm() {
    $('#editModal').addClass('hidden');
}

let sectionIdToDelete = null;

function showSectionDeleteForm(id) {
    sectionIdToDelete = id; 
    $('#deleteSectionModal').removeClass('hidden'); 
}

function hideSectionDeleteForm() {
    $('#deleteSectionModal').addClass('hidden');
}

function confirmSectionDelete() {
    if (sectionIdToDelete) {
        $.ajax({
            url: `/professors/sections/delete/${sectionIdToDelete}`,
            type: 'DELETE',
            success: function() {
                $(`#sectionRow-${sectionIdToDelete}`).remove();
                hideSectionDeleteForm();
            },
            error: function(xhr) {
                console.error('Failed to delete section');
                alert(xhr.responseJSON.message); 
            }
        });
    }
}

let courseIdToDelete = null;

function showDeleteForm(id) {
    courseIdToDelete = id;
    $('#deleteModal').removeClass('hidden');
}

function hideDeleteForm() {
    $('#deleteModal').addClass('hidden');
}

function confirmDelete() {
    if (courseIdToDelete) {
        $.ajax({
            url: `/professors/courses/delete/${courseIdToDelete}`,
            type: 'DELETE',
            success: function() {
                $(`#courseRow-${courseIdToDelete}`).remove(); 
                hideDeleteForm(); 
            },
            error: function(xhr) {
                console.error('Failed to delete course');
                alert(xhr.responseJSON.message);
            }
        });
    }
}

function showLessonEditForm(lessonId, lessonName, sectionId, description, type, content, time) {
    $('#edit-lesson-id').val(lessonId);
    $('#edit-lesson-name').val(lessonName);
    $('#edit-section_id').val(sectionId);
    $('#edit-description').val(description);
    $('#edit-type').val(type);
    $('#edit-content').val(content);
    $('#edit-time').val(time);
    $('#editLessonModal').removeClass('hidden');
}
  
function hideLessonEditForm() {
    $('#editLessonModal').addClass('hidden');
}

function showLessonCreateForm() {
    $('#createLessonModal').removeClass('hidden');
}

function hideLessonCreateForm() {
    $('#createLessonModal').addClass('hidden');
}

function removeLessonForm(button) {
    const form = $(button).closest('.lesson-form');
    if ($('.lesson-form').length > 1) {
        form.remove();
    } else {
        alert('Không thể xóa bài học cuối cùng!');
    }
}

let lessonIdToDelete = null;

function showLessonDeleteForm(id) {
    lessonIdToDelete = id;
    $('#deleteLessonModal').removeClass('hidden');
}

function hideLessonDeleteForm() {
    $('#deleteLessonModal').addClass('hidden');
}

function confirmLessonDelete() {
    if (lessonIdToDelete) {
        $.ajax({
            url: `/professors/lessons/delete/${lessonIdToDelete}`,
            type: 'DELETE',
            success: function() {
                $(`#lessonRow-${lessonIdToDelete}`).remove(); 
                hideLessonDeleteForm(); 
            },
            error: function(xhr) {
                console.error('Failed to delete lesson');
                alert(xhr.responseJSON.message); 
            }
        });
    }
}


function addSectionForm() {
    const container = $('#sectionsContainer');
    const newForm = $(`
        <div class="section-form">
            <label for="name">Section Name</label>
            <input type="text" name="name[]" required>
            <label for="edit-courseId">Course</label>
            <select name="course_id[]" required>
                ${courses.map(course => `<option value="${course.id}">${course.name}</option>`).join('')}
            </select>
            <label for="total_time">Total Time</label>
            <input type="number" name="total_time[]" required>
            <label for="total_lesson">Total Lesson</label>
            <input type="number" name="total_lesson[]" required>
            <button type="button" class="remove-btn" onclick="removeSectionForm(this)">Xóa</button>
        </div>
    `);
    container.append(newForm);
}

function addLessonForm() {
    const container = $('#lessonsContainer');
    const newForm = $(`
        <div class="lesson-form">
            <label for="name">Lesson Name</label>
            <input type="text" name="name[]" required>
            <label for="section_id">Section</label>
            <select name="section_id[]" required>
                ${sections.map(section => `<option value="${section.id}">${section.name}</option>`).join('')}
            </select>
            <label for="type">Type</label>
            <select name="type[]" required>
                <option value="" disabled selected>Type</option>
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
                <option value="text">Text</option>
                <option value="url">URL</option>
            </select>
            <label for="content">Content</label>
            <input type="text" name="content[]" required>
            <label for="description">Description</label>
            <input type="text" name="description[]" required>
            <label for="time">Time</label>
            <input type="number" name="time[]" required>
            <button type="button" class="remove-btn" onclick="removeLessonForm(this)">Delete</button>
        </div>
    `);
    container.append(newForm);
}

function showSections(courseId) {
    $(`#sections-${courseId}`).removeClass('hidden');
}

function hideSections(courseId) {
    $(`#sections-${courseId}`).addClass('hidden');
}

function showLessons(courseId) {
    $(`#lessons-${courseId}`).removeClass('hidden');
}

function hideLessons(courseId) {
    $(`#lessons-${courseId}`).addClass('hidden');
}

