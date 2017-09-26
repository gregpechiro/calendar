$(document).ready(function() {

	var eventId;

	$('#taskModal').on('hidden.bs.modal', function() {
		clearForm();
		$('div#activities').addClass('hide');
		eventId = null;
	});

	var form = 'form#taskForm';
	var activityForm = 'form#activityForm';

	function clearForm() {
		$(form + ' input#name').val('');
		$(form + ' textarea#description').val('');
        $(form + ' input[id="id"]').remove();
        $(form + ' a.confirm-action').addClass('hide');
	}

	function fillForm(event) {
		$(form + ' input[id="name"]').val(event.title);
		if (event.end == null) {
			event.end = event.start.clone();
			event.end.add(1, 'hours');
		}
		$(form + ' input[id="startString"]').val(event.start.toISOString());
		$(form + ' input[id="endString"]').val(event.end.toISOString());
		$(form + ' textarea[id="description"]').val(event.description);
		$(form).append('<input type="hidden" id="id" name="id" value="' + event.id + '"/>');
		$(form).append('<input type="hidden" id="id" name="id" value="' + event.id + '"/>');
		$(form + ' a.confirm-action').attr('data-url', '/event/' + event.id);
		$(form + ' a.confirm-action').removeClass('hide');
	}

    $('button#save').click(function() {
        saveEvent();
    });

	$('button#activityAction').click(function() {
        saveActivity(eventId);
    });

    function saveEvent() {
        $.ajax({
            url:'/event',
            type:'POST',
            data: $(form).serialize(),
            success:function(resp) {
                // clearForm();
                $('#taskModal').modal('hide');
                if (resp.error) {
                    $.Notification.autoHideNotify('error', 'top right', resp.msg);
                    return
                }
                $.Notification.autoHideNotify('success', 'top right', resp.msg);
                calendar.fullCalendar( 'refetchEvents' );
            },
            error: function(e, d) {
                // clearForm();
                $('#taskModal').modal('hide');
                console.log(e);
                console.log(d);
                $.Notification.autoHideNotify('error', 'top right', 'Error contacting server');
            }
        });
    }

	/*function fillActivityForm(event) {
		$(form + ' input[id="name"]').val(event.title);
		if (event.end == null) {
			event.end = event.start.clone();
			event.end.add(1, 'hours');
		}
		$(form + ' input[id="startString"]').val(event.start.toISOString());
		$(form + ' input[id="endString"]').val(event.end.toISOString());
		$(form + ' textarea[id="description"]').val(event.description);
		$(form).append('<input type="hidden" id="id" name="id"/>');
		$(form + ' input[id="id"]').val(event.id);
		$(form + ' a.confirm-action').attr('data-url', '/event/' + event.id);
		$(form + ' a.confirm-action').removeClass('hide');
	}*/

	function getActivities(eid) {
		$.ajax({
			url:'/event/' + eid + '/activity',
			type: 'GET',
			success: function(resp) {
				if (resp.error) {
					$.Notification.autoHideNotify('error', 'top right', resp.msg);
					return;
				}
				genActivities(resp.data);
			},
			error: function(e, d) {
				console.log(e);
                console.log(d);
                $.Notification.autoHideNotify('error', 'top right', 'Error contacting server');
			}
		})
	}

	function genActivities(activities) {
		var a;
		for (var i = 0; i < activities.length; i++) {
			a +=
			'<tr><td>' + activities[i].type + '</td>' +
			'<td>' + moment(Math.floor(activities[i].start / 1000000)).format("h:mma M/DD/YY") + '</td>' +
			'<td>' + (activities[i].end > 0 ? moment(Math.floor(activities[i].end / 1000000)).format("h:mma M/DD/YY") : '') +'</td>' +
			'<td>Action</td></tr>';
		}
		$('tbody#allActivities').html(a);
	}

	function saveActivity(eid) {
		$.ajax({
            url:'/event/' + eid + '/activity',
            type:'POST',
            data: $(activityForm).serialize(),
            success:function(resp) {
                if (resp.error) {
                    $.Notification.autoHideNotify('error', 'top right', resp.msg);
                    return
                }
                genActivities(resp.data);
            },
            error: function(e, d) {
                console.log(e);
                console.log(d);
                $.Notification.autoHideNotify('error', 'top right', 'Error contacting server');
            }
        });
	}

	var calendar = $('#calendar').fullCalendar({
        defaultDate: new Date(),
		editable: true,
		eventLimit: true,
		events: '/event',
        selectable: true,
        selectHelper: true,
		header: {
			left: 'prev,today,next',
			center: 'title',
			right: 'month,agendaWeek,agendaDay'
		},
        select: function(start, end, js, view) {
            if (start.date() == (end.date() - 1) && view.name === 'month') {
                $('#calendar').fullCalendar('changeView', 'agendaDay');
                $('#calendar').fullCalendar('gotoDate', start);
            } else {
                if (view.name === 'month') {
                    end.subtract(1, 'days');
                    $(form + ' input[id="startString"]').val(start.toISOString() + 'T09:00:00');
                    $(form + ' input[id="endString"]').val(end.toISOString() + 'T17:00:00');
                } else {
                    $(form + ' input[id="startString"]').val(start.toISOString());
                    $(form + ' input[id="endString"]').val(end.toISOString());
                }
                $(form + ' input[id="view"]').val(view.name);
                $('#taskModal').modal('show');
            }
        },
		eventClick: function(event, jsEvent, view) {
			$('div#activities').removeClass('hide');
			fillForm(event);
			eventId = event.id;
			getActivities(eventId);
			$('#taskModal').modal('show');
		},
		eventDrop: function(event, delta, revertFunction, jsEvent, ui, view) {
			fillForm(event);
			saveEvent();
		},
		eventResize: function(event, delta, revertFunction, jsEvent, ui, view) {
			fillForm(event);
            saveEvent();
		},
		eventMouseover: function(calEvent, jsEvent) {
            var tooltip = '<div class="tooltipevent" style="">' + calEvent.title + '</div>';
            $("body").append(tooltip);
            $(this).mouseover(function(e) {
                $(this).css('z-index', 10000);
                $('.tooltipevent').fadeIn('500');
                $('.tooltipevent').fadeTo('10', 1.9);
            }).mousemove(function(e) {
                $('.tooltipevent').css('top', e.pageY + 10);
                $('.tooltipevent').css('left', e.pageX + 20);
            });
        },
        eventMouseout: function(calEvent, jsEvent) {
            $(this).css('z-index', 8);
            $('.tooltipevent').remove();
        }
	});

    confirm.yes = function(btn) {
        $.ajax({
            url:btn.attr('data-url'),
            type: 'DELETE',
            success:function(resp) {
                // clearForm();
                $('#taskModal').modal('hide');
                $.Notification.autoHideNotify('success', 'top right', resp.msg);
                calendar.fullCalendar( 'refetchEvents' );
            },
            error: function(e, d) {
                console.log(e);
                console.log(d);
                // clearForm();
                $('#taskModal').modal('hide');
            }
        });
    }
});
