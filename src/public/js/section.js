function showSectionCreateForm() {
    $('#createSectionModal').removeClass('hidden');
}

function hideSectionCreateForm() {
    $('#createSectionModal').addClass('hidden');
}

function removeSectionForm(button) {
    $(button).parent().remove();
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
        fetch(`/professors/sections/delete/${sectionIdToDelete}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    const row = document.getElementById(`sectionRow-${sectionIdToDelete}`);
                    if (row) row.remove(); 
                    hideSectionDeleteForm();
                } else {
                    console.error('Failed to delete section');
                    response.json().then(data => alert(data.message)); 
                }
            })
            .catch(error => console.error('Error:', error));
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
            success: function(response) {
                const row = $(`#courseRow-${courseIdToDelete}`);
                if (row.length) {
                    row.remove(); 
                }
                hideDeleteForm(); 
            },
            error: function(xhr) {
                console.error('Failed to delete course');
                alert(xhr.responseJSON.message);
            }
        });
    }
}

