# assert-the-unexpected

[![NPM version](https://badge.fury.io/js/assert-the-unexpected.svg)](http://badge.fury.io/js/assert-the-unexpected)
[![Build Status](https://travis-ci.org/alexjeffburke/assert-the-unexpected.svg?branch=master)](https://travis-ci.org/alexjeffburke/assert-the-unexpected)
[![Coverage Status](https://img.shields.io/coveralls/alexjeffburke/assert-the-unexpected.svg?style=flat)](https://coveralls.io/r/alexjeffburke/assert-the-unexpected?branch=master)

This implements the node core `assert` API as an Unexpected facade.

# Compatibility

A great deal of emphasis was placed on compatibility and this module aims to
be a drop-in replacement. It was developed against the node core test suite
which it passes with the exception of the following:
* circular references are not supported
* deepEqual() **not** throwing on comparisons of:
    - "a" to {0:'a'} (supported for Arrays)
    - mismatching prototypes

The libary has been tested against the follwing baseline versions of node assert:
 - **4.7.3**
 - **6.15.1**
