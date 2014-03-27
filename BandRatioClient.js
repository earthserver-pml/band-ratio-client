(function(global, $) {
   'use strict';


   var BandRatioClient = window.BandRatioClient = function(conf) {


      //setup basic darg.drop options for later use
      this.baseDragOptions = {
         containment: '#main',
         revert: 'invalid',
         helper: 'clone',
         zIndex: 300000000

      };

      this.dragOptionsPostDrop = {
         containment: '#drop_panel',
         //revert : 'invalid',
         zIndex: 300000,
         // drag: function(ev, ui) {
         //    $('.ui-selected').css({
         //       'top': ui.helper.css('top'),
         //       'left': ui.helper.css('left')
         //    });
         // }
      };

      this.dropOptions = {
         accept: '.chiclet:not(.dropped)',
         drop: this.handleDrop.bind(this),
         over: function(event, ui) {
            $(".ui-draggable.op").draggable({
               grid: [50, 50]
            });
         },
      };

      this.binOptions = {
         drop: this.deleteThing.bind(this)
      };


      // hack element to attach custom events to
      this.eventObj = {};
      // list of operations that have been dropped 
      this.operations = [];
      this.petascopeURL_GET = 'http://earthserver.pml.ac.uk/petascope?query=';
      this.petascopeURL_POST = 'http://earthserver.pml.ac.uk/petascope/wcps';



      // cache jQuery selectors
      this.dropPanel = $('#drop_panel');
      this.wcpsResponseEL = $('.wcps_response');
      this.dropTextEL = $('#drop_text');
      this.runQueryEL = $('#run_query');
      this.showQueryEL = $('#show_query');

      // WCPS query templates
      this.min_query = 'for a in (CCI_Rrs_FREQ_monthly) return encode ( min(a[x:"CRS:1"(1799:2220),y:"CRS:1"(240:660),t(4)]), "csv")';
      this.max_query = 'for a in (CCI_Rrs_FREQ_monthly) return encode( max((a[x:"CRS:1"(1799:2220),y:"CRS:1"(240:660),t(4)] * (a[x:"CRS:1"(1799:2220),y:"CRS:1"(240:660),t(4)] != 9.96921e+36))), "csv")';
      this.avgQuery = 'for a in (CCI_Rrs_FREQ_monthly) return encode( ( (float)add((a[x:"CRS:1"(1799:2220),y:"CRS:1"(240:660),t(4)] * (a[x:"CRS:1"(1799:2220),y:"CRS:1"(240:660),t(4)] != 9.96921e+36))) / count(( (a[x:"CRS:1"(1799:2220),y:"CRS:1"(240:660),t(4)] != 9.96921e+36))) ), "csv")';


      this.initialise();

   };


   BandRatioClient.prototype.initialise = function() {

      this.setup_binds();
   };

   BandRatioClient.prototype.onBandDrop = function(event, a, b) {
      console.log('something dropped');
      this.operations.push(new Operation(b, a));

      // local reference
      var op = new Operation(b, a);

      // if we have stuff on the design pane we update helper text
      if (this.operations.length > 0) {
         this.dropTextEL.text('To remove elements drag them on to bin');
      }
   };
   BandRatioClient.prototype.onFreqDrop = function(event, a, opts) {
      console.log(opts);
      var preExist = $.grep(this.operations, function(e) {
         return e.id === a;
      });

      if (preExist.length === 1) {
         var op = preExist[0];

         if (opts.type === 'freq') {
            op['bin_' + opts.bin] = opts.value;
         }
         if (opts.type === 'operation') {
            var old_op = $.grep(this.operations, function(e) {
               return e.id === opts.value;
            });
            if (old_op.length === 1) {
               op.setBin(opts.bin, old_op[0]);
            } else {
               console.log("oh bugger this is bad!!!!!");
            }
            this.operations = $.grep(this.operations, function(e) {
               return e.id !== opts.value;
            });
         }
         if (opts.type === 'number') {
            op.setBin(opts.bin, opts.value);
         }
         if (opts.type === 'min') {
            op.setBin(opts.bin, opts.value);
         }
         if (opts.type === 'max') {
            op.setBin(opts.bin, opts.value);
         }
         if (opts.type === 'avg') {
            op.setBin(opts.bin, opts.value);
         }
         if (opts.type === 'median') {
            op.setBin(opts.bin, opts.value);
         }

      }

   };

   BandRatioClient.prototype.queryClick = function() {

      var WCPS = this.generateWCPS();
      if (WCPS.indexOf('ERROR') != -1) {
         WCPS = WCPS.split(' - ')[1];

         console.log('No freqs so showing error box');
         var t_div = $(document.createElement('div'));
         t_div.html(WCPS);
         $(t_div).dialog({
            content: WCPS
         });
      } else {
         var src_url = (this.petascopeURL_GET + WCPS).replace(/\+/g, '%2b');
         this.wcpsResponseEL.attr('src', src_url);
      }

   };
   BandRatioClient.prototype.showQuery = function() {
      var WCPS = this.generateWCPS();
      if (WCPS.indexOf('ERROR') != -1) {
         WCPS = WCPS.split(' - ')[1];
      }
      console.log('khkjhkjh');
      var t_div = $(document.createElement('div'));
      t_div.html(WCPS);
      $(t_div).dialog({
         content: WCPS
      });

   };
   BandRatioClient.prototype.setup_binds = function() {

      // basic handler for dealing with anything dropped on design pane
      $(this.eventObj).on('band_ratio.dropped', this.onBandDrop.bind(this));

      // specific handler for when a light frequency is dropped on the design pane
      $(this.eventObj).on('band_ratio.freq_dropped', this.onFreqDrop.bind(this));

      // simple handlers for run/show query buttons

      this.runQueryEL.on('click', this.queryClick.bind(this));

      this.showQueryEL.on('click', this.showQuery.bind(this));
      $('.chiclet').draggable(this.baseDragOptions);

      // initialise the #drop_panel as a droppable with basic options
      $('#drop_panel').droppable(this.dropOptions);

      // initialise the #bin drop target
      $('#bin').droppable(this.binOptions);
      var contrast_values = [0, 2550, 10200, 22950, 40800, 63750, 91800, 124950, 163200, 206550, 255000, 308550, 367200, 430950, 499800, 573750, 652800, 736950, 826200, 920550, 1020000];

      $('#contrast').slider({
         value: 1,
         min: 0,
         max: 20,
         step: 1,
         slide: function(event, ui) {
            console.log(contrast_values[ui.value]);
            $('#_contrast').val(contrast_values[ui.value]);
         }
      });

   };


   // utility functions - maybe abstract these to different class?

   BandRatioClient.prototype.generateWCPS = function() {
      console.log('generating WCPS');
      var query = 'for ';
      var contrast = $('#_contrast').val();
      if (contrast.length === 0) {
         contrast = '255';
      }
      if (this.operations.length === 1) {
         console.log('inside ops');
         var freqs = this.removeDupes(this.operations[0].getFreqs());
         if (freqs.length === 0) {
            return "ERROR - No Frequencies used in algorithm.";
         }
         console.log('after remove dupes');
         var temp_freqs = [];
         for (var i = 0, len = freqs.length; i < len; i++) {
            temp_freqs.push(freqs[i] + ' in (CCI_' + freqs[i] + '_monthly)');
         }
         query += temp_freqs.join(',');
         query += 'return encode(';
         query += this.operations[0].rootRender();
         query += '* ' + contrast + ', "PNG", "NODATA=0")';
      } else {
         console.log('Unable to create WCPS as no elements have been created');
      }
      return query;
   };

   BandRatioClient.prototype.removeDupes = function(array) {
      if (array.length > 0) {
         for (var b = array.sort(), i = b.length, l = b[--i], r = [l]; i--;)
            if (b[i] !== l)
               r.push(l = b[i]);
         return r;
      }
      return array;
   };


   BandRatioClient.prototype.testFreq = function(freq) {
      // TBD : just returns true for now
      console.log('test freq against available freqs');
      return true;

   };

   BandRatioClient.prototype.getMedian = function(freq, elem) {
      // var min_query = 'for a in (CCI_Rrs_FREQ_monthly) return encode ( min(a[x:"CRS:1"(1799:2220),y:"CRS:1"(240:660),t(4)]), "csv")';
      // var max_query = 'for a in (CCI_Rrs_FREQ_monthly) return encode( max((a[x:"CRS:1"(1799:2220),y:"CRS:1"(240:660),t(4)] * (a[x:"CRS:1"(1799:2220),y:"CRS:1"(240:660),t(4)] != 9.96921e+36))), "csv")';

      var min_query = this.min_query.replace('FREQ', freq);
      var max_query = this.max_query.replace('FREQ', freq);
      console.log('####', elem);
      $.when($.ajax({
         type: 'POST',
         context: this,
         url: this.petascopeURL_POST,
         data: {
            'query': min_query
         }
      }), $.ajax({
         type: 'POST',
         context: this,
         url: this.petascopeURL_POST,
         data: {
            'query': max_query
         }
      }), {
         'elem': elem,
         'this': this
      }).done(function(min, max, context) {
         console.log('woop defered worked');
         console.log(context.elem);
         context.this.addMedian(min[0], max[0], context.elem);


      });



   };

   BandRatioClient.prototype.addMedian = function(min, max, elem) {
      min = min.substring(1);
      min = min.substring(0, min.length - 1);
      max = max.substring(1);
      max = max.substring(0, max.length - 1);

      var median = +min + ((max - min) / 2);
      // //console.log('adding ' + resp + ' to ' + that);

      console.log(min, max, elem, median);
      console.log($($(elem).parent()).attr('id'));

      $(elem).text(median.toFixed(6));
      $(this.eventObj).trigger('band_ratio.freq_dropped', [$($(elem).parent()).attr('id'), {
         'bin': $(elem).data('bin'),
         'type': 'median',
         'value': median
      }]);


   };


   BandRatioClient.prototype.getAvg = function(freq, elem) {

      //var avgQuery = 'for a in (CCI_Rrs_FREQ_monthly) return encode( ( (float)add((a[x:"CRS:1"(1799:2220),y:"CRS:1"(240:660),t(4)] * (a[x:"CRS:1"(1799:2220),y:"CRS:1"(240:660),t(4)] != 9.96921e+36))) / count(( (a[x:"CRS:1"(1799:2220),y:"CRS:1"(240:660),t(4)] != 9.96921e+36))) ), "csv")',
      var query;

      if (this.testFreq(freq)) {
         query = this.avgQuery.replace('FREQ', freq);
         console.log(query);
         $.ajax({
            url: this.petascopeURL_POST,
            type: 'POST',
            context: this,
            data: {
               'query': query
            },
            success: function(resp) {
               this.addAvg(resp, elem);
            }
         });


      } else {
         return;
      }


   };

   BandRatioClient.prototype.addAvg = function(resp, elem) {

      resp = resp.substring(1);
      resp = resp.substring(0, resp.length - 1);
      //console.log('adding ' + resp + ' to ' + that);

      console.log(resp);
      $(elem).text((+resp).toFixed(6));
      $(this.eventObj).trigger('band_ratio.freq_dropped', [$($(elem).parent()).attr('id'), {
         'bin': $(elem).data('bin'),
         'type': 'avg',
         'value': resp
      }]);


   };


   BandRatioClient.prototype.getMinMax = function(minmax, frq, elem) {
      //var min_query = 'for a in (CCI_Rrs_FREQ_monthly) return encode ( min(a[x:"CRS:1"(1799:2220),y:"CRS:1"(240:660),t(4)]), "csv")';
      //var max_query = 'for a in (CCI_Rrs_FREQ_monthly) return encode( max((a[x:"CRS:1"(1799:2220),y:"CRS:1"(240:660),t(4)] * (a[x:"CRS:1"(1799:2220),y:"CRS:1"(240:660),t(4)] != 9.96921e+36))), "csv")';
      var query;

      if (minmax.indexOf('min') === -1 && minmax.indexOf('max') === -1) {
         return "error";
      }
      if (minmax === 'min') {
         query = this.min_query.replace('FREQ', frq);
      }
      if (minmax === 'max') {
         query = this.max_query.replace('FREQ', frq);
      }


      $.ajax({
         type: 'POST',
         context: this,
         url: this.petascopeURL_POST,
         data: {
            'query': query
         },
         success: function(resp) {
            this.addMinMax(resp, elem);
         }
      });

      //return 'blah';
   };

   BandRatioClient.prototype.addMinMax = function(resp, elem) {

      resp = resp.substring(1);
      resp = resp.substring(0, resp.length - 1);
      //console.log('adding ' + resp + ' to ' + that);

      console.log(resp);
      $(elem).text((+resp).toFixed(6));
      $(this.eventObj).trigger('band_ratio.freq_dropped', [$($(elem).parent()).attr('id'), {
         'bin': $(elem).data('bin'),
         'type': 'min',
         'value': resp
      }]);


   };

   BandRatioClient.prototype.deleteThing = function(ev, ui) {
      this.dropTextEL.text('Drag elements onto this panel');

      this.operations = $.grep(this.operations, function(n, i) {
         return n.id !== $(ui.helper).attr('id');
      });

      // HMMMMMM FIX THIS
      //ui.draggable.appendTo()
      $('.ui-selected').appendTo(ui.helper);
      $(ui.helper).remove();

   };

   BandRatioClient.prototype.handleDrop = function(ev, ui) {

      switch ($(ui.helper).context['id']) {
         case 'plus':
            this.addOp(ui, this.dropPanel, 'plus');
            break;
         case 'minus':
            this.addOp(ui, this.dropPanel, 'minus');
            break;
         case 'divide':
            this.addOp(ui, this.dropPanel, 'divide');
            break;
         case 'multiply':
            this.addOp(ui, this.dropPanel, 'multiply');
            break;
         default:
            console.log('something other than an Op was dropped so ignoring it');
            break;

      }


   };

   BandRatioClient.prototype.addOp = function(el, drop, operation) {

      var selector = '#' + operation + '_temp';
      var bin1_selector = '.drop_' + operation + '_1';
      var bin2_selector = '.drop_' + operation + '_2';

      var elem = $(selector).clone(true).attr({
         id: new Date().getUTCMilliseconds()
      }).removeClass('hide').css({
         position: 'absolute',
         left: el.position.left - $(drop).offset().left,
         top: el.position.top - $(drop).offset().top,
         zIndex: 3
      }).addClass('dropped').draggable(this.dragOptionsPostDrop);

      elem.children(bin1_selector).droppable({
         accept: '.chiclet:not(.dropped), .holder',
         drop: this.binDrop.bind(this)
      }).data('index', '1');
      elem.children(bin2_selector).droppable({
         accept: '.chiclet:not(.dropped), .holder',
         drop: this.binDrop.bind(this)
      }).data('index', '2');
      //$.data(elem, '_tyspe','plus');
      elem.appendTo($(drop));
      console.log('triggering dropped');
      $(this.eventObj).trigger('band_ratio.dropped', [elem.attr('id'), operation]);

   };

   BandRatioClient.prototype.binDrop = function(ev, ui) {
      console.log('dropped in bin');
      var uiHelper = $(ui.helper);
      var uiHelperCtx = $(ui.helper.context);
      var evTarget = $(ev.target);
      var uiDraggableCtx = $(ui.draggable.context);
      var newClone,
         freq;
      console.log(uiHelper);
      if (uiHelper.hasClass('holder')) {
         console.log('inside holder if');
         //this block is for dropping boxes on boxes
         uiHelper.remove();
         var op_drop = uiHelper.clone(true).removeClass('ui-draggable-dragging')
            .addClass('scaleOn')
            .addClass('dropped')
            .draggable({
               containment: '#' + evTarget.parent().attr('id')
            });
         evTarget.css({
            'background': 'blue'
         });
         evTarget.append(op_drop);
         op_drop.css({
            position: 'relative',
            left: -40,
            top: -30,
            xIndex: 3
         });

         op_drop.hover(function() {
            $(this).removeClass('scaleOn');
         }, function() {
            $(this).addClass('scaleOn');
         });

         evTarget.droppable('disable').removeClass('ui-state-disable');
         $(this.eventObj).trigger('band_ratio.freq_dropped', [$(evTarget.parent()).attr('id'), {
            'bin': evTarget.data('bin'),
            'type': 'operation',
            'value': uiHelperCtx.attr('id')
         }]);

      } else if (uiHelperCtx.attr('id') === 'number') {
         //this block is for dropping constants on boxes
         var user_number = prompt('please enter a number:', '1');
         newClone = uiHelper.clone(true).removeClass('ui-draggable-dragging').css({
            position: 'relative',
            left: 0,
            top: 0,
            zIndex: 3
         }).addClass('chiclet').addClass('dropped').text(user_number); //.draggable();

         evTarget.append(newClone)
            .droppable('disable')
            .removeClass('ui-state-disabled')
            .data('freq', uiDraggableCtx.attr('id'));
         $(evTarget.parent()).data('box_' + evTarget.data('index'), evTarget.data('freq'));
         $(this.eventObj).trigger('band_ratio.freq_dropped', [$(evTarget.parent()).attr('id'), {
            'bin': evTarget.data('bin'),
            'type': 'number',
            'value': $(newClone).text()
         }]);


      } else if (uiHelperCtx.attr('id') === 'min') {
         //this block is for dropping mins on boxes
         freq = prompt('please enter a light frequency');
         newClone = uiHelper.clone(true).removeClass('ui-draggable-dragging').css({
            posistion: 'relative',
            left: 0,
            top: 0,
            zIndex: 3
         }).addClass('chiclet').addClass('dropped').text('waiting...'); //.draggable();

         evTarget.append(newClone)
            .droppable('disable')
            .removeClass('ui-state-disabled')
            .data('freq', uiDraggableCtx.attr('id'));
         $(evTarget.parent()).data('box_' + evTarget.data('index'), evTarget.data('freq'));
         this.getMinMax('min', freq, evTarget);


      } else if (uiHelperCtx.attr('id') === 'max') {
         //this block is for dropping maxs on boxes
         freq = prompt('please enter a light frequency');
         newClone = uiHelper.clone(true).removeClass('ui-draggable-dragging').css({
            posistion: 'relative',
            left: 0,
            top: 0,
            zIndex: 3
         }).addClass('chiclet').addClass('dropped').text('waiting...'); //.draggable();

         evTarget.append(newClone)
            .droppable('disable')
            .removeClass('ui-state-disabled')
            .data('freq', uiDraggableCtx.attr('id'));
         $(evTarget.parent()).data('box_' + evTarget.data('index'), evTarget.data('freq'));
         this.getMinMax('max', freq, evTarget);


      } else if (uiHelperCtx.attr('id') === 'avg') {
         //this block is for dropping maxs on boxes
         freq = prompt('please enter a light frequency');
         newClone = uiHelper.clone(true).removeClass('ui-draggable-dragging').css({
            posistion: 'relative',
            left: 0,
            top: 0,
            zIndex: 3
         }).addClass('chiclet').addClass('dropped').text('waiting...'); //.draggable();

         evTarget.append(newClone)
            .droppable('disable')
            .removeClass('ui-state-disabled')
            .data('freq', uiDraggableCtx.attr('id'));
         $(evTarget.parent()).data('box_' + evTarget.data('index'), evTarget.data('freq'));
         this.getAvg(freq, evTarget);
         console.log('dropped avg() for freq', freq);


      } else if (uiHelperCtx.attr('id') === 'median') {
         //this block is for dropping maxs on boxes
         freq = prompt('please enter a light frequency');
         newClone = uiHelper.clone(true).removeClass('ui-draggable-dragging').css({
            posistion: 'relative',
            left: 0,
            top: 0,
            zIndex: 3
         }).addClass('chiclet').addClass('dropped').text('waiting...'); //.draggable();

         evTarget.append(newClone)
            .droppable('disable')
            .removeClass('ui-state-disabled')
            .data('freq', uiDraggableCtx.attr('id'));
         $(evTarget.parent()).data('box_' + evTarget.data('index'), evTarget.data('freq'));
         this.getMedian(freq, evTarget);
         console.log('dropped avg() for freq', freq);


      } else {
         newClone = uiHelper.clone(true).removeClass('ui-draggable-dragging')
            .css({
               position: 'relative',
               left: 0,
               top: 0,
               zIndex: 3
            }).addClass('chiclet')
            .addClass('dropped');
         evTarget.append(newClone)
            .droppable('disable')
            .removeClass('ui-state-disabled')
            .data('freq', $(ui.draggable.context).attr('id'));

         $(evTarget.parent()).data('box_' + evTarget.data('index'), evTarget.data('freq'));
         $(this.eventObj).trigger('band_ratio.freq_dropped', [$(evTarget.parent()).attr('id'), {
            'bin': evTarget.data('bin'),
            'type': 'freq',
            'value': evTarget.data('freq')
         }]);

      }
   };

   BandRatioClient.prototype.logPos = function(newClone) {
      console.log($(newClone).offset());
      console.log($(newClone).position());
   };

   BandRatioClient.prototype.getOverview = function() {
      $.each($('#drop_panel').children(), function(e) {
         console.log($(this).data());
      });
   };


}(window, jQuery));