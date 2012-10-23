/*

  1. Save a hash to a table in postgres.
  2. Only save entries in the hash that need to be saved.
  3. be as simple as possible
  4. don't require shitty configuration like: 'foo': { type: 'varchar(255)', constraints: {'not null'}}

  Idol: Carbon paper.  Just write and it will take care of the rest.  Thats what
        I want for my database.

  newUser = Heart('users')
  newUser.set('email', 'test@test.com')
  newUser.save()

  var User = Heart.bar('users')

  users = db.query('select * from users', function(rows) {
    rows.map(function(row) {
      return User(row)
    })
  })
*/

var pg = require('pg')

var Database = {
  config: {},
  query: function(query, cb) {
    pg.connect(this.config, function(err, client) {
      if (err) throw err;
      client.query(query, function(err, result) {
        if (err) throw err;
        cb(result)
      })
    })
  }
}

Database.config = { database: 'jar_test' }

var sql = function(hash) {
  var columns = Object.keys(hash)
  var values = columns.map(function(col) {
    var val = hash[col];
    // quote
    return "'" + val + "'";
  })
  return {
    columns: columns,
    values: values,
    create: function(table) {
      return "insert into " + table + ' (' + this.columns + ') values (' + this.values + ')'
    },
    update: function(table) {
      var updateStatements = [];
      for(i = 0; i < columns.length; i++) {
        var col = this.columns[i]
        var val = this.values[i]
        updateStatements.push(col + ' = ' + val)
      }
      return "update " + table + ' set ' + updateStatements.join(',')
    }
  }
}

var Heart = function(table, attrs) {
  if (attrs === null || typeof attrs === 'undefined') {
    attrs = {}
  };
  return {
    table: table,
    dirty: false,
    changedAttrs: {},
    attrs: attrs,
    get: function(attr) {
      return this.attrs[attr]
    },
    // set('foo', 'bar'), set({foo: 'bar', name: 'justin'})
    set: function(attr, val) {
      // object
      if (attr === Object(attr)) {
        attrs = attr
      }
      // key, value
      else {
        attrs = { attr: val }
      }
      for(attr in attrs) {
        var val = attrs[attr]
        this.changedAttrs[attr] = val
        this.attrs[attr] = val
      }
      this.dirty = true
      return this
    },
    save: function(cb) {
      var lazyStatement = sql(this.changedAttrs)
      if (this.attrs.id) {
        var query = lazyStatement.update(this.table)
        Database.query(query, function(result) {
          if (cb) cb(result)
        })
      }
      else {
        var query = lazyStatement.create(this.table)
        Database.query(query, function(result) {
          if(cb) cb(result)
        })
      }
      this.changedAttrs = {}
      this.dirty = false
    }
  }
}

Heart.brand = function(table) {
  return function(attrs) {
    return Heart(table, attrs)
  }
}

Heart.Database = Database
module.exports = Heart