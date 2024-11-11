function showSectionCreateForm() {
    $('#createSectionModal').removeClass('hidden');
}

function hideSectionCreateForm() {
    $('#createSectionModal').addClass('hidden');
}

function removeSectionForm(button) {
    $(button).closest('.section-form').remove();
}

function showSectionEditForm(id, sectionName, courseId) {
    $('#edit-section-id').val(id);
    $('#edit-section-name').val(sectionName);
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

function showEditForm(id, name, categoryId, description, price) {
    $("#edit-id").val(id);
    $("#edit-name").val(name || "");
    $("#edit-course-description").val(description || "");
    $("#edit-categoryId").val(categoryId || "");
    $("#edit-price").val(price || 0);
    $("#editModal").removeClass("hidden");
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
            success: function () {
                $(`#sectionRow-${sectionIdToDelete}`).remove();
                hideSectionDeleteForm();
            },
            error: function (xhr) {
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
            success: function () {
                $(`#courseRow-${courseIdToDelete}`).remove();
                hideDeleteForm();
            },
            error: function (xhr) {
                console.error('Failed to delete course');
                alert(xhr.responseJSON.message);
            }
        });
    }
}

function showLessonEditForm(
    lessonId,
    lessonName,
    sectionId,
    description,
    type,
    content,
    time,
    course_id
  ) {
    $("#edit-lesson-id").val(lessonId);
    $("#edit-lesson-name").val(lessonName);
    $("#edit-section_id").val(sectionId);
    $("#edit-description").val(description);
    $("#edit-type").val(type);
    $("#edit-content").val(content);
    $("#edit-time").val(time);
  
    $(`.editLessonModal[id='${course_id}']`).removeClass("hidden");
  }
  function hideLessonEditForm(course_id) {
    $(`.editLessonModal[id='${course_id}']`).addClass("hidden");
  }
  
  function showLessonCreateForm(course_id) {
    $(`#createLessonModal-${course_id}`).removeClass("hidden");
}

function hideLessonCreateForm(course_id) {
    $(`#createLessonModal-${course_id}`).addClass("hidden");
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
    $('.deleteLessonModal').removeClass('hidden');
}

function hideLessonDeleteForm() {
    $('.deleteLessonModal').addClass('hidden');
}

function confirmLessonDelete() {
    if (lessonIdToDelete) {
        $.ajax({
            url: `/professors/lessons/delete/${lessonIdToDelete}`,
            type: 'DELETE',
            success: function () {
                $(`#lessonRow-${lessonIdToDelete}`).remove();
                hideLessonDeleteForm();
            },
            error: function (xhr) {
                console.error("Failed to delete lesson");
                alert(xhr.responseJSON?.message || "An error occurred.");
            }
        });
    }
}

function addSectionForm() {
    const sectionsContainer = document.getElementById('sectionsContainer');
    const currentIndex = sectionsContainer.children.length;

    const sectionFormHtml = `
        <div class="section-form" data-index="${currentIndex}">
            <div class="section-form-content">
                <label for="name">Section</label>
                <input type="text" name="name[]" id="name_${currentIndex}" required data-index="${currentIndex}">
                <ul id="create-section-error-name_${currentIndex}" class="error-messages" data-error="name" data-index="${currentIndex}"></ul>
            </div>

            <div class="section-form-content">
                <label for="courseId">Course</label>
                <select name="course_id[]" id="courseId_${currentIndex}" required data-index="${currentIndex}">
                    ${courses.map(course => `<option value="${course.id}">${course.name}</option>`).join('')}
                </select>
                <ul id="create-section-error-course_id_${currentIndex}" class="error-messages" data-error="courseId" data-index="${currentIndex}"></ul>
            </div>
        </div>
    `;

    sectionsContainer.insertAdjacentHTML('beforeend', sectionFormHtml);
}

function addLessonForm(course_id) {
    const container = $("#lessonsContainer");
    const newForm = $(`
          <div class="lesson-form">
              <div class="lesson-form-content">
                  <label for="name">Lesson Name</label>
                  <input type="text" name="name[]" required>
              </div>
              <div class="lesson-form-content">
                  <label for="section_id">Section</label>
                  <select name="section_id[]" required>
                      ${sections
                        .map(
                          (section) =>
                            `<option value="${section.id}">${section.name}</option>`
                        )
                        .join("")}
                  </select>
              </div>
              <div class="lesson-form-content">
                  <label for="type">Type</label>
                  <select name="type[]" required>
                      <option value="" disabled selected>Type</option>
                      <option value="video">Video</option>
                      <option value="pdf">PDF</option>
                      <option value="text">Text</option>
                      <option value="url">URL</option>
                  </select>
              </div>
              <div class="lesson-form-content">
                  <label for="content">Content</label>
                  <input type="text" name="content[]" required>
              </div>
              <div class="lesson-form-content">
                  <label for="description">Description</label>
                  <input type="text" name="description[]" required>
              </div>
              <div class="lesson-form-content">
                  <label for="time">Time</label>
                  <input type="number" name="time[]" required>
              </div>
              <button type="button" class="remove-btn" onclick="removeLessonForm(this)">Remove</button>
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

document.addEventListener('DOMContentLoaded', function() {
    const createCourseForm = document.getElementById('createCourseForm');
    const submitButton = document.querySelector('#createCourseForm .save-btn button');

    if (createCourseForm && submitButton) {
        let isSubmitting = false; 

        async function handleSubmit(event) {
            event.preventDefault();

            if (isSubmitting) return;

            isSubmitting = true; 
            submitButton.disabled = true;
            submitButton.textContent = "Processing...";

            const nameValue = document.getElementById('course-name')?.value.trim();
            const descriptionValue = document.getElementById('course-description')?.value.trim();
            const categoryIdValue = document.getElementById('categoryId')?.value;
            const priceValue = document.getElementById('price')?.value;

            const formData = {
                name: nameValue,
                description: descriptionValue,
                category_id: categoryIdValue,
                price: priceValue
            };

            try {
                const response = await fetch('/professors/courses/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.status === 400 && result.errors) {
                    document.querySelectorAll('.error-messages').forEach(el => el.innerHTML = '');
                    result.errors.forEach(error => {
                        const errorElement = document.createElement('li');
                        errorElement.textContent = error.messages.join(', ');
                        document.getElementById(`error-${error.property}`).appendChild(errorElement);
                    });
                    showCreateForm(); 
                } else if (response.ok) {
                    window.location.href = '/professors/courses';
                }
            } catch (error) {
                console.error("Failed to submit form:", error);
            } finally {
                isSubmitting = false; 
                submitButton.disabled = false;
                submitButton.textContent = "Save";
            }
        }

        createCourseForm.addEventListener('submit', handleSubmit);
    }
});


document.addEventListener('DOMContentLoaded', function() {
    const updateCourseForm = document.getElementById('updateCourseForm');
    const updateButton = document.querySelector('#updateCourseForm .save-btn button');

    if (updateCourseForm && updateButton) {
        let isSubmittingUpdate = false;

        async function handleUpdateSubmit(event) {
            event.preventDefault();

            if (isSubmittingUpdate) return;

            isSubmittingUpdate = true;
            updateButton.disabled = true;
            updateButton.textContent = "Processing...";

            const formData = {
                id: document.getElementById('edit-id').value,
                name: document.getElementById('edit-name').value,
                description: document.getElementById('edit-course-description').value,
                category_id: document.getElementById('edit-categoryId').value,
                price: document.getElementById('edit-price').value
            };

            try {
                const response = await fetch('/professors/courses/edit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.status === 400 && result.errors) {

                    document.querySelectorAll('.error-messages').forEach(el => el.innerHTML = '');

                    result.errors.forEach(error => {
                        const errorContainer = document.getElementById(`edit-error-${error.property}`);
                        if (errorContainer) {
                            error.messages.forEach(message => {
                                const errorElement = document.createElement('li');
                                errorElement.textContent = message;
                                errorContainer.appendChild(errorElement);
                            });
                        } else {
                            console.warn(`No error container found for ${error.property}`);
                        }
                    });

                    document.getElementById('editModal').classList.remove('hidden');
                } else if (response.ok) {
                    window.location.href = '/professors/courses';
                }
            } catch (error) {
                console.error("Failed to submit form:", error);
            } finally {
                isSubmittingUpdate = false;
                updateButton.disabled = false;
                updateButton.textContent = "Save";
            }
        }

        updateCourseForm.addEventListener('submit', handleUpdateSubmit);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const createSectionForm = document.getElementById('showSectionCreateForm');
    const submitButton = document.querySelector('#showSectionCreateForm .save-btn button');

    if (createSectionForm && submitButton) {
        let isSubmitting = false;

        async function handleSubmit(event) {
            event.preventDefault();

            if (isSubmitting) return;

            isSubmitting = true;
            submitButton.disabled = true;
            submitButton.textContent = "Processing...";

            const formData = {
                name: Array.from(document.querySelectorAll('input[name="name[]"]'))
                            .map(input => input.value)
                            .filter(value => value.trim() !== ''), // Loại bỏ các giá trị trống
                course_id: Array.from(document.querySelectorAll('select[name="course_id"]')).map(select => parseInt(select.value)),
            };

            try {
                const response = await fetch('/professors/sections/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                document.querySelectorAll('.error-messages').forEach(el => el.innerHTML = '');

                if (response.status === 400 && result.errors) {
                    result.errors.forEach(error => {
                        const errorElement = document.createElement('li');
                        errorElement.textContent = error.messages.join(', ');

                        const [field, index] = error.property.split('_');
                        const errorContainer = document.querySelector(`ul.error-messages[data-error="${field}"][data-index="${index}"]`);
                        if (errorContainer) {
                            errorContainer.appendChild(errorElement);
                        }
                    });
                } else if (response.ok) {
                    window.location.href = '/professors/courses';
                }
            } catch (error) {
                console.error("Gửi form thất bại:", error);
            } finally {
                isSubmitting = false;
                submitButton.disabled = false;
                submitButton.textContent = "Save";
            }
        }

        createSectionForm.addEventListener('submit', handleSubmit);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const updateSectionForm = document.getElementById('updateSectionForm');
    const submitButton = document.querySelector('#updateSectionForm .save-btn button');

    if (updateSectionForm && submitButton) {
        let isSubmitting = false; 

        async function handleSubmit(event) {
            event.preventDefault();

            if (isSubmitting) return; 

            isSubmitting = true; 
            submitButton.disabled = true;
            submitButton.textContent = "Processing...";

            const formData = {
                id: document.getElementById('edit-section-id').value,
                name: document.getElementById('edit-section-name').value.trim(),
                course_id: document.getElementById('edit-courseId').value,
            };
            try {
                const response = await fetch('/professors/sections/edit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                document.querySelectorAll('.error-messages').forEach(el => el.innerHTML = '');

                if (response.status === 400 && result.errors) {
                    result.errors.forEach(error => {
                        const errorElement = document.createElement('li');
                        errorElement.textContent = error.messages.join(', ');
                        
                        const errorContainer = document.getElementById(`edit-section-error-${error.property}`);
                        if (errorContainer) {
                            errorContainer.appendChild(errorElement);
                        }
                    });
                } else if (response.ok) {
                    window.location.href = '/professors/courses';
                }
            } catch (error) {
                console.error("Failed to submit form:", error);
            } finally {
                isSubmitting = false; 
                submitButton.disabled = false;
                submitButton.textContent = "Save";
            }
        }

        updateSectionForm.addEventListener('submit', handleSubmit);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const lessonForms = document.querySelectorAll('form#lessonCreateForm');

    lessonForms.forEach((createLessonForm) => {
        const submitButton = createLessonForm.querySelector('.save-btn button');

        if (createLessonForm && submitButton) {
            let isSubmitting = false;

            async function handleLessonSubmit(event) {
                event.preventDefault();

                if (isSubmitting) return;

                isSubmitting = true;
                submitButton.disabled = true;
                submitButton.textContent = "Processing...";

                const formData = {
                    name: Array.from(createLessonForm.querySelectorAll('input[name="name[]"]'))
                                .map(input => input.value)
                                .filter(value => value.trim() !== ''),
                    section_id: Array.from(createLessonForm.querySelectorAll('select[name="section_id[]"]')).map(select => parseInt(select.value)),
                    type: Array.from(createLessonForm.querySelectorAll('select[name="type[]"]')).map(select => select.value),
                    content: Array.from(createLessonForm.querySelectorAll('input[name="content[]"]')).map(input => input.value),
                    description: Array.from(createLessonForm.querySelectorAll('input[name="description[]"]')).map(input => input.value),
                    time: Array.from(createLessonForm.querySelectorAll('input[name="time[]"]')).map(input => parseInt(input.value)),
                };

                try {
                    const response = await fetch('/professors/lessons/create', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });

                    const result = await response.json();

                    // Xóa tất cả các thông báo lỗi trước đó
                    createLessonForm.querySelectorAll('.error-messages').forEach(el => el.innerHTML = '');

                    if (response.status === 400 && result.errors) {
                        result.errors.forEach(error => {
                            const errorElement = document.createElement('li');
                            errorElement.textContent = error.messages.join(', ');

                            const [field, index] = error.property.split('_');
                            const errorContainer = createLessonForm.querySelector(`ul.error-messages[data-error="${field}"][data-index="${index}"]`);
                            if (errorContainer) {
                                errorContainer.appendChild(errorElement);
                            }
                        });
                    } else if (response.ok) {
                        window.location.href = '/professors/courses';
                    }
                } catch (error) {
                    console.error("Gửi form thất bại:", error);
                } finally {
                    isSubmitting = false;
                    submitButton.disabled = false;
                    submitButton.textContent = "Save";
                }
            }

            createLessonForm.addEventListener('submit', handleLessonSubmit);
        }
    });
});