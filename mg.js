
function MG(ob, w, h) {
	this.ob = document.getElementById(ob);
	this.w = w || 20;
	this.h = h || 20;
	this.grid_size = 20;
	this.grid_str = "";
	this.grids = [];
	this.grid_ob = [];
	this.is_moved = false;
	this.mark_history = false;
	this.mark_history2 = false;
	this.chkCanvasTagSupport();
}

MG.prototype = {
	init: function () {
		var x, y;
		this.grids = [];
		this.grid_ob = [];
		this.grid_str = "";
		this.grids[this.w * this.h - 1] = 0;
		/*for (y = 0; y < this.h; y ++)
			for (x = 0; x < this.w; x ++) {
				//this.grids.push(Math.floor(Math.random() * 16).toString(16));
				this.grids.push(0);
			}*/
		//this.grid_str = this.grids.join("");
		return this;
	},
	set: function (sets) {

		if (sets.width) this.w = sets.width;
		if (sets.height) this.h = sets.height;
		return this;
	},
	create: function () {

		var t1, t0 = (new Date()).getTime();
		this.init();
		this._walk(Math.floor(Math.random() * this.grids.length));
		t1 = (new Date()).getTime();
		if (typeof console != "undefined") {
			console.log("Time used:" + (t1 - t0) + "ms");
		}
		return this;
	},
	_walk: function (startPos) {

		this._walk_history = [];
		this._walk_history2 = [];
		var current_pos = startPos;
		while (this._getNext0() != -1) {

			current_pos = this._step(current_pos);
			if (typeof(current_pos) != "number") break;
		}
		return this;
	},
	_getTargetSteps: function (current_pos) {

		var p = 0,
			a = [];


		p = current_pos - this.w;
		if (p > 0 && !this.grids[p] && !this._isRepeating(p))
			a.push(p);
		else
			a.push(-1);

		p = current_pos + 1;
		if (p % this.w != 0 && !this.grids[p] && !this._isRepeating(p))
			a.push(p);
		else
			a.push(-1);

		p = current_pos + this.w;
		if (p < this.grids.length && !this.grids[p] && !this._isRepeating(p))
			a.push(p);
		else
			a.push(-1);

		p = current_pos - 1;
		if (current_pos % this.w != 0 && !this.grids[p] && !this._isRepeating(p))
			a.push(p);
		else
			a.push(-1);

		return a;
	},
	_noStep: function () {
		for (var i = 0; i < this._target_steps.length; i ++)
			if (this._target_steps[i] != -1)
				return false;
		return true;
	},
	_step: function (current_pos) {
		this._target_steps = this._getTargetSteps(current_pos);
		if (this._noStep()) {
			var tmp = this._walk_history.pop();
			if (typeof(tmp) != "number") return false;
			this._walk_history2.push(tmp);
			return this._step(tmp);
		}

		var r = Math.floor(Math.random() * 4),
			next_pos,
			grids = this.grids;

		while (this._target_steps[r] == -1) {
			r = Math.floor(Math.random() * 4);
		}
		next_pos = this._target_steps[r];

		var is_cross = false;
		if (grids[next_pos])
			is_cross = true;

		switch (r) {
			case 0:

				grids[current_pos] ^= 1;
				grids[next_pos] ^= 4;
				break;
			case 1:

				grids[current_pos] ^= 2;
				grids[next_pos] ^= 8;
				break;
			case 2:

				grids[current_pos] ^= 4;
				grids[next_pos] ^= 1;
				break;
			case 3:

				grids[current_pos] ^= 8;
				grids[next_pos] ^= 2;
		}
		this._walk_history.push(current_pos);

		return is_cross ? false : next_pos;
	},
	_isRepeating: function (p) {
		var i,
			a = this._walk_history,
			a2 = this._walk_history2,
			l = a.length,
			l2 = a2.length;
		for (i = 0; i < l; i ++) {
			if (a[i] == p) return true;
		}
		for (i = 0; i < l2; i ++) {
			if (a2[i] == p) return true;
		}
		return false;
	},
	_getNext0: function () {
		for (var i = 0, l = this.grids.length; i <= l; i ++) {
			if (!this.grids[i])
				return i;
		}
		return -1;
	},
	chkCanvasTagSupport: function () {
		this.canvas = document.createElement("canvas");
		this.is_canvas_valid = !! this.canvas.getContext;
	},
	clear: function () {
		this.canvas = null;
		while (this.ob.childNodes[0])
			this.ob.removeChild(this.ob.childNodes[0]);
		return this;
	},
	show: function () {
		this.clear();
		if (this.is_canvas_valid) {
			this._showByCanvas();
		} else {
			this._showByDOM();
		}
		this.me = new MG_Me(this);
		return this;
	},
	_showByDOM: function () {
		var tmp_ob, i, grid_ob = this.grid_ob,
			w = this.w,
			h = this.h,
			len = w * h,
			grid_size = this.grid_size,
			grids = this.grids,
			fragement = document.createDocumentFragment();
		this.ob.style.width = grid_size * w + 2 + "px";
		this.ob.style.height= grid_size * h + 2 + "px";

		for (i = 0; i < len; i ++) {
			tmp_ob = document.createElement("div");
			tmp_ob.setAttribute("class", "grid");
			tmp_ob.setAttribute("className", "grid");
			tmp_ob.style.width = grid_size + "px";
			tmp_ob.style.height = grid_size + "px";
			tmp_ob.style.left = grid_size * (i % w) + "px";
			tmp_ob.style.top = grid_size * Math.floor(i / w) + "px";

			MG.border(tmp_ob, grids[i]);
			grid_ob.push(tmp_ob);
			fragement.appendChild(tmp_ob);
		}

		tmp_ob.setAttribute("class", "grid mg_finish");
		//tmp_ob.setAttribute("className", "grid mg_finish");
		this.ob.appendChild(fragement);
	},
	_showByCanvas: function () {
		var grid_size = this.grid_size,
			grids = this.grids,
			w = grid_size * this.w,
			h = grid_size * this.h;
		this.ob.style.width = w + "px";
		this.ob.style.height= h + "px";
		this.canvas = document.createElement("canvas");
		this.canvas.setAttribute("width", w);
		this.canvas.setAttribute("height", h);
		this.ob.appendChild(this.canvas);

		var x, y, ix, iy,
			w = this.w,
			h = this.h,
			i, len = w * h,
			ctx = this.canvas.getContext("2d");
		this.ctx = ctx;
		ctx.fillStyle = "#f5f5f5";
		ctx.fillRect(0, 0, w, h);
		for (i = 0; i < len; i ++) {
			ix = grid_size * (i % w);
			iy = grid_size * Math.floor(i / w);
			MG.border2(ctx, ix, iy, ix + grid_size, iy + grid_size, grids[i]);
		}
		var finish_img = new Image();
		finish_img.src = "finish.gif";
		finish_img.className = "finish-img";
		//this.ctx.drawImage(finish_img, w - this.grid_size + 2, h - this.grid_size + 2);
		this.ob.appendChild(finish_img);
	},
	fillBox: function (grid_i, c) {
		this.ctx.fillStyle = c;
		var x = (grid_i % this.w) * this.grid_size,
			y = Math.floor(grid_i / this.w) * this.grid_size;;;;
		this.ctx.fillRect(x, y, this.grid_size, this.grid_size);

		var v = this.grids[grid_i];
		MG.border2(this.ctx, x, y, x + this.grid_size, y + this.grid_size, v);
	}
};

MG.border = function (ob, v) {
	if (!v) {
		ob.style.backgroundColor = "#666";
		return;
	}
	if (v & 1)
		ob.style.borderTop = "solid 1px #f5f5f5";
	if (v & 2)
		ob.style.borderRight = "solid 1px #f5f5f5";
	if (v & 4)
		ob.style.borderBottom = "solid 1px #f5f5f5";
	if (v & 8)
		ob.style.borderLeft = "solid 1px #f5f5f5";
};
MG.border2 = function (ctx, ix, iy, ix2, iy2, v) {
	if (!v) {
		ctx.fillRect(ix, iy, ix2, iy2);
		return;
	}

	ctx.strokeStyle = "#aaa";
	ctx.lineWidth = 1;
	var _d = function (x1, y1, x2, y2) {
		ctx.beginPath();
		ctx.moveTo(x1 + 0.5, y1 + 0.5);
		ctx.lineTo(x2 + 0.5, y2 + 0.5);
		ctx.closePath();
		ctx.stroke();
	};

	if (!(v & 1))
		_d(ix, iy, ix2, iy);
	if (!(v & 2))
		_d(ix2, iy, ix2, iy2);
	if (!(v & 4))
		_d(ix, iy2, ix2, iy2);
	if (!(v & 8))
		_d(ix, iy, ix, iy2);
};


function MG_Me(mg) {
	this.mg = mg || null;
	this.pos = 0;
	this.history = [0];
	this.history2 = [0];
	this.is_moving = false;
	this.last_move = new Date();
	this.finished = false;
	this.emotions = {
		normal: "me.gif",
	};

	if (this.mg) this.init();
}

MG_Me.prototype = {
	init: function () {
		var tmp_ob = document.createElement("div"),
			tmp_img = document.createElement("img"),
			tmp_info = document.createElement("div"),
			tmp_span = document.createElement("p"),
			_this = this;
		tmp_info.setAttribute("class", "inform");
		tmp_info.setAttribute("className", "inform");
		this.inform_box = tmp_info;
		this.inform_span = tmp_span;
		tmp_info.appendChild(tmp_span);
		tmp_ob.appendChild(tmp_info);
		tmp_img.setAttribute("src", "me.gif");
		this.me_img = tmp_img;
		tmp_ob.setAttribute("class", "me");
		tmp_ob.setAttribute("className", "me");
		tmp_ob.appendChild(tmp_img);
		tmp_ob.style.width = this.mg.grid_size + "px";
		tmp_ob.style.height = this.mg.grid_size + "px";
		this.ob = tmp_ob;
		this.mg.ob.appendChild(this.ob);

		$.hotkeys.add("up", function () {
			_this.move(0);
		});
		$.hotkeys.add("right", function () {
			_this.move(1);
		});
		$.hotkeys.add("down", function () {
			_this.move(2);
		});
		$.hotkeys.add("left", function () {
			_this.move(3);
		});
		setTimeout(function () {
			if (_this.mg.is_moved) return;
			_this.inform(SANSI_TOY_MSG.keyboard_hint);
		}, 3000);

		this.itvl = setInterval(function () {
			if (!_this.mg.is_moved) return;
			var now = new Date();
			if (now - _this.last_move > 10000) {
				_this.inform(SANSI_TOY_MSG.hello);
				_this.setEmotion("surprised");
			}
		}, 3000);

		this.setMark(1, this.mg.mark_history);
		//this.setMark(2, this.mg.mark_history2);
	},
	move: function (d) {
		if (this.is_moving || this.finished) return;
		this.mg.is_moved = true;
		var v = this.mg.grids[this.pos];
		if (v & Math.pow(2, d)) {
			if (d == 0)
				this.moveTo(this.pos - this.mg.w);
			if (d == 1)
				this.moveTo(this.pos + 1);
			if (d == 2)
				this.moveTo(this.pos + this.mg.w);
			if (d == 3)
				this.moveTo(this.pos - 1);
		}
		this.last_move = new Date();
	},
	moveTo: function (p) {
		this.is_moving = true;
		this.inform();
		this.setEmotion("normal");
		this.history.unshift(p);
		if (this.mg.mark_history) {
			if (this.mg.is_canvas_valid) {
				this.mg.fillBox(this.history[0], "#ffcccc");
			} else {
				this.mg.grid_ob[this.history[0]].style.backgroundColor = "#fcc";
			}
		}
		/*if (this.history2[0] == p) {
			this.history2.shift();
		} else {
			if (this.mg.mark_history2)
				this.mg.grid_ob[this.history2[0]].style.backgroundColor = "#f99";
			this.history2.unshift(p);
		}*/
		var x = p % this.mg.w,
			y = Math.floor(p / this.mg.w),
			top = y * this.mg.grid_size + "px",
			left = x * this.mg.grid_size + "px",
			_this = this;

		$(this.ob).animate({
				top: top,
				left: left
			}, 100, "linear", function () {
				_this.pos = p;
				_this.is_moving = false;
				var v = _this.mg.grids[p];
				if (p == _this.mg.grids.length - 1) {
					_this.inform(SANSI_TOY_MSG.win);
					_this.finished = true;
					_this.setEmotion("happy");
					clearInterval(_this.itvl);
				} else if (p != 0 && (v == 1 || v == 2 || v == 4 || v == 8)) {
					_this.inform(SANSI_TOY_MSG.blind_alley);
					_this.setEmotion("unhappy");
				} else if (p == 0) {
					_this.inform(SANSI_TOY_MSG.back_to_the_start);
					_this.setEmotion("surprised");
				}
			});
	},
	inform: function (s) {
		if (s) {
			$(this.inform_span).html(s);
			$(this.inform_box).fadeIn(500);
		} else {
			$(this.inform_box).fadeOut(500);
		}
	},
	setEmotion: function (em) {
		if (this._emotion_str == em) return;
		if (this.emotions[em]) {
			this.me_img.setAttribute("src", this.emotions[em]);
			this._emotion_str = em;
		}
	},
	setMark: function (h, v) {
		var i;
		if (h == 1) {
			this.mg.mark_history = v;
			for (i = 0; i < this.history.length; i ++) {
				if (this.mg.is_canvas_valid) {
					this.mg.fillBox(this.history[i], v ? "#ffcccc" : "#f5f5f5");
				} else {
					this.mg.grid_ob[this.history[i]].style.backgroundColor = v ? "#fcc" : "#f5f5f5";
				}
			}
		} else if (h == 2) {
			this.mg.mark_history2 = v;
			for (i = 0; i < this.history2.length; i ++) {
				if (this.mg.is_canvas_valid) {
					this.mg.fillBox(this.history2[i], v ? "#ff9999" : "#f5f5f5");
				} else {
					this.mg.grid_ob[this.history2[i]].style.backgroundColor = v ? "#f99" : "#f5f5f5";
				}
			}
		}
	}
};

