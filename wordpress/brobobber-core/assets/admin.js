/* Admin fields of Brobobber Core: media pickers, sortable galleries, repeating rows and the import. */
(function ($) {
  'use strict'

  function initSortable(scope) {
    $(scope).find('.bbc-thumbs').sortable({ tolerance: 'pointer' })
    $(scope).find('.bbc-rows-list').sortable({ handle: '.bbc-handle', axis: 'y', update: function () { renumber($(this).closest('.bbc-rows')) } })
  }

  // Row inputs carry their position in the name, so it follows the order on screen.
  function renumber($rows) {
    var name = $rows.data('name')
    $rows.children('.bbc-rows-list').children('.bbc-row').each(function (i) {
      $(this).find('[name]').each(function () {
        if (this.name.indexOf(name + '[') === 0) this.name = name + '[' + i + ']' + this.name.slice(this.name.indexOf(']', name.length + 1) + 1)
      })
    })
  }

  $(document).on('click', '.bbc-add-row', function () {
    var $rows = $(this).closest('.bbc-rows')
    var $list = $rows.children('.bbc-rows-list')
    var html = $rows.children('template').html().replace(/__i__/g, $list.children().length)
    $list.append(html)
    initSortable($list.children().last())
  })

  $(document).on('click', '.bbc-remove-row', function () {
    var $rows = $(this).closest('.bbc-rows')
    $(this).closest('.bbc-row').remove()
    renumber($rows)
  })

  $(document).on('click', '.bbc-pick', function () {
    var $box = $(this).closest('.bbc-media')
    var kind = $box.data('kind')
    var frame = wp.media({ title: kind === 'video' ? 'Выберите видео' : 'Выберите фото', library: { type: kind }, multiple: false, button: { text: 'Выбрать' } })
    frame.on('select', function () {
      var file = frame.state().get('selection').first().toJSON()
      $box.find('input').val(file.id)
      var $preview = $box.find('.bbc-preview').empty()
      if (kind === 'video') $('<span class="bbc-file">').text(file.filename).appendTo($preview)
      else $('<img alt="">').attr('src', (file.sizes && file.sizes.thumbnail ? file.sizes.thumbnail : file).url).appendTo($preview)
    })
    frame.open()
  })

  $(document).on('click', '.bbc-clear', function () {
    var $box = $(this).closest('.bbc-media')
    $box.find('input').val('0')
    $box.find('.bbc-preview').empty()
  })

  $(document).on('click', '.bbc-add-photos', function () {
    var $gallery = $(this).closest('.bbc-gallery')
    var frame = wp.media({ title: 'Добавьте фото', library: { type: 'image' }, multiple: 'add', button: { text: 'Добавить' } })
    frame.on('select', function () {
      frame.state().get('selection').each(function (item) {
        var file = item.toJSON()
        var $li = $('<li>')
        $('<input type="hidden">').attr('name', $gallery.data('name')).val(file.id).appendTo($li)
        $('<img alt="">').attr('src', (file.sizes && file.sizes.thumbnail ? file.sizes.thumbnail : file).url).appendTo($li)
        $('<button type="button" class="bbc-remove" aria-label="Убрать">×</button>').appendTo($li)
        $gallery.find('.bbc-thumbs').append($li)
      })
    })
    frame.open()
  })

  $(document).on('click', '.bbc-remove', function () { $(this).closest('li').remove() })

  $('#bbc-run').on('click', function () {
    var $button = $(this).prop('disabled', true).text('Идёт импорт…')
    var $status = $('#bbc-status')
    var $bar = $('#bbc-progress')
    var failures = 0
    function fail(message) {
      $status.text('Ошибка: ' + message)
      $button.prop('disabled', false).text('Продолжить')
    }
    function step() {
      $.post(bbcAdmin.ajax, { action: 'bbc_import', nonce: bbcAdmin.nonce }).done(function (response) {
        failures = 0
        if (!response.success) return fail((response.data && response.data.message) || 'неизвестная ошибка')
        $bar.attr('max', response.data.total).val(response.data.done)
        $status.text(response.data.done + ' из ' + response.data.total + ' файлов')
        if (response.data.finished) {
          $status.text('Готово: контент, меню и страницы созданы.')
          $button.prop('disabled', false).text('Запустить ещё раз')
        } else step()
      }).fail(function (xhr) {
        // A long image can hit the host's time limit: what was saved stays, so simply go on.
        if (++failures <= 3) return setTimeout(step, 1500)
        fail('сервер ответил ' + xhr.status)
      })
    }
    step()
  })

  initSortable(document)
})(jQuery)
