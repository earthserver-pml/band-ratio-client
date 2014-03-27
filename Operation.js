/**
 * const
 */
var OpTypeEnum = {
   'multiply': {
      'sign': '*'
   },
   'plus': {
      'sign': '+'
   },
   'divide': {
      'sign': '/'
   },
   'minus': {
      'sign': '-'
   }
};

/**
 * @Class Operation
 * @param {Object} type_
 */
var Operation = function(type_, id) {

   // these need to become slightly dynamic but this will do for DEMO
   this.bounds = '[x(-30:5),y(35:70),t(4)]';

   this.id = id;
   this._type = OpTypeEnum[type_];
   this.bin_1 = {};
   this.bin_2 = {};
   this.digit_reg = /^-?\d*(\.\d+)?$/; // this regex should figure out any positive or negative number including floats
   this.freq_reg = /^Rrs_[0-9]{3}$/;

};

Operation.prototype.setBin_1 = function(contents) {
   this.bin_1 = contents;
};

Operation.prototype.setBin_2 = function(contents) {
   this.bin_2 = contents;
};
Operation.prototype.setBin = function(bin, contents) {
   this['bin_' + bin] = contents;
};

Operation.prototype.getType = function() {
   return this._type;
};

Operation.prototype.renderWCPS = function() {
   var output = '';
   var bin1 = this.bin_1 instanceof Operation ? '(' + this.bin_1.renderWCPS() + ')' : this.bin_1;
   var bin2 = this.bin_2 instanceof Operation ? '(' + this.bin_2.renderWCPS() + ')' : this.bin_2;

   // check for numerical constants being used

   bin1 = this.digit_reg.test(bin1) ? bin1 : bin1; // + this.bounds;
   bin2 = this.digit_reg.test(bin2) ? bin2 : bin2; // + this.bounds;

   output = '(' + bin1 +' '+ this._type.sign +' '+ bin2 + ')';
   return output;
};
Operation.prototype.rootRender = function() {
   var output = '';
   var bin1 = this.bin_1 instanceof Operation ? '(' + this.bin_1.renderWCPS() + ')' : this.bin_1;
   var bin2 = this.bin_2 instanceof Operation ? '(' + this.bin_2.renderWCPS() + ')' : this.bin_2;

   // check for numerical constants being used

   bin1 = this.digit_reg.test(bin1) ? bin1 : bin1; // + this.bounds;
   bin2 = this.digit_reg.test(bin2) ? bin2 : bin2; // + this.bounds;

   output = '(' + bin1 +' '+ this._type.sign +' '+ bin2 + ')' + this.bounds;
   return output;

};

Operation.prototype.getFreqs = function() {
   console.log(this);
   console.log(this.digit_reg.test(this.bin_1));
   var freqs = [];
   if (!this.digit_reg.test(this.bin_1)) {
      freqs = freqs.concat(this.freq_reg.test(this.bin_1) ? this.bin_1 : this.bin_1.getFreqs());
   }
   if (!this.digit_reg.test(this.bin_2)) {
      freqs = freqs.concat(this.freq_reg.test(this.bin_2) ? this.bin_2 : this.bin_2.getFreqs());
   }
   console.log('after stupid');
   return freqs;

};