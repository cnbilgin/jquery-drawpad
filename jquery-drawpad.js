(function ($) {
	const pluginSuffix = "drawpad";
	$.drawpad = function (element, options) {
		let defaults = {
			defaultColor: "#000000",
			colors: [
				"#000000", //black
				"#2ecc71", //green
				"#3498db", //blue
				"#e74c3c", //red
				"#f1c40f", //yellow
				"#9b59b6", //purple
				"#e67e22", //orange
			],
			eraserSize: 10,
		};

		let plugin = this;
		let $element = $(element);

		plugin.settings = {};

		const coordinate = { x: 0, y: 0 };
		let drawing = false;
		let drawingType = "pen";
		const lineStyle = {
			width: 5,
			color: "black",
			type: "round",
		};

		/* private methods */
		const createCanvas = () => {
			plugin.$canvas = $("<canvas></canvas>");
			plugin.canvas = plugin.$canvas.get(0);
			plugin.context = plugin.canvas.getContext("2d");

			return plugin.$canvas;
		};
		const resizeCanvas = () => {
			plugin.canvas.width = $element.width();
			plugin.canvas.height = $element.height();
		};
		const createToolbox = () => {
			const $toolbox = $(`<div class="${pluginSuffix}-toolbox"></div>`);
			const createColorbox = (color) => {
				const activeClass = `${pluginSuffix}-colorbox-active`;
				let $colorbox = $(
					`<div class="${pluginSuffix}-colorbox" style="background-color:${color};"></div>`
				);
				if (color === plugin.settings.defaultColor)
					$colorbox.addClass(activeClass);

				$colorbox.click(() => {
					$element.removeClass(`${pluginSuffix}-erase-mode`);
					lineStyle.color = color;
					drawingType = "pen";
					$colorbox
						.addClass(activeClass)
						.siblings()
						.removeClass(activeClass);
				});

				return $colorbox;
			};
			const createEraser = () => {
				const activeClass = `${pluginSuffix}-colorbox-active`;
				const $eraser = $(
					`<div class="${pluginSuffix}-colorbox ${pluginSuffix}-eraser"></div>`
				);

				$eraser.click(function () {
					drawingType = "eraser";
					$element.addClass(`${pluginSuffix}-erase-mode`);
					$eraser
						.addClass(activeClass)
						.siblings()
						.removeClass(activeClass);
				});

				return $eraser;
			};

			const $colors = $(`<div class="${pluginSuffix}-colors"></div>`);
			plugin.settings.colors.forEach((color) => {
				$colors.append(createColorbox(color));
			});

			$colors.append(createEraser());
			$toolbox.append($colors);

			return $toolbox;
		};

		const updateCoordinate = (event) => {
			coordinate.x = event.offsetX;
			coordinate.y = event.offsetY;
		};

		const handleStartDraw = (event) => {
			drawing = true;
			$element.addClass(`${pluginSuffix}-drawing`);
			updateCoordinate(event);
			handleDraw(event);
		};
		const handleStopDraw = () => {
			drawing = false;
			$element.removeClass(`${pluginSuffix}-drawing`);
		};
		const handleDraw = (event) => {
			if (!drawing) return;
			const ctx = plugin.context;

			ctx.beginPath();
			switch (drawingType) {
				case "pen":
					ctx.globalCompositeOperation = "source-over";
					ctx.lineWidth = lineStyle.width;
					ctx.strokeStyle = lineStyle.color;
					break;
				case "eraser":
					ctx.globalCompositeOperation = "destination-out";
					ctx.lineWidth = plugin.settings.eraserSize;

					break;
			}
			ctx.lineCap = lineStyle.type;
			ctx.moveTo(coordinate.x, coordinate.y);
			updateCoordinate(event);
			ctx.lineTo(coordinate.x, coordinate.y);

			ctx.stroke();
		};

		const initialize = () => {
			$element.addClass(pluginSuffix);
			$element.append(createCanvas());
			$element.append(createToolbox());
			resizeCanvas();

			plugin.$canvas.on("mousedown", handleStartDraw);
			plugin.$canvas.on("mouseup", handleStopDraw);
			plugin.$canvas.on("mousemove", handleDraw);
		};

		/* public methods */
		plugin.init = function () {
			plugin.settings = $.extend({}, defaults, options);
			initialize();
			return plugin;
		};

		plugin.clear = function () {
			plugin.context.clearRect(
				0,
				0,
				plugin.context.canvas.width,
				plugin.context.canvas.height
			);
		};

		plugin.init();
	};

	$.fn.drawpad = function (options) {
		if ($(this).data(pluginSuffix) === undefined) {
			var plugin = new $.drawpad(this, options);
			$(this).data(pluginSuffix, plugin);
		}

		return $(this).data(pluginSuffix);
	};
})(jQuery);
