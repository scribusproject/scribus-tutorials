Navigation = function()
{
    self = this;
    
    this.load_page = function(page_name)
    {
        this._loading_page = true;
        $.ajax(
            {
                url: page_name,
                success: function(data){self.set_content_from_md(data, page_name)},
                error: function(jqXHR, status, error_msg){self.load_failiure(page_name, status, error_msg)}
            }
        );
    };
    
    this.load_failiure = function(page, status, msg)
    {
        nav_item = self._pages[page];
        if (nav_item)
            nav_item.addClass('error');
        show_msg_box();
        window.location.hash = self._current_page ? self._current_page : self._home;
    };

    this.open_directory = function(dir, update_hash)
    {
        var parts = dir.split('/');

        var cdir = '';
        var children;
        for (i=0; i < parts.length; i++)
        {
            // If we haven't opened this dir already, load it via ajax
            if ((!cdir && $.isEmptyObject(this._pages)) || (cdir && this._pages[cdir].children('ol').length == 0))
            {
                $.ajax(
                {
                    url: cdir + 'contents',
                    success: function(data){self.process_contents_file(data, cdir)},
                    mimeType: 'text/plain',
                    async: false
                });
            }
            if (cdir)
                children = this._pages[cdir].children('ol');
            cdir += parts[i] + '/';
        }

        if (update_hash)
        {
            window.location.hash = this.get_first_href(children);
        }
    };

    /**
     * This function loads in a new contents file into the class.
     */
    this.process_contents_file = function(data, dir)
    {
        var first_load = $.isEmptyObject(this._pages);
        var contents = data.split("\n")

        var parent = dir ? $('<ol></ol>').appendTo(this._pages[dir]) : this.nav_list;

        for (var i = 0; i < contents.length; i++)
        {
            entry = contents[i].trim();
            if (entry === "")
                continue;

            // Format url title
            var parts = entry.split(' ');
            var surl = parts.shift();
            var url = dir + surl;
            var title = parts.join(' ');
            this._pages[url] = $('<li><a href="#'+ url + '">' + title + '</a></li>').appendTo(parent);

            if (url.slice(-1) == '/')
                this._pages[url].addClass('folder');
        }

        if (first_load) // set the home for empty hash
        {
            this._home = this.get_first_href(parent);
        }
    };

    this.get_first_href = function(obj)
    {
        return $('a', obj.children()[0]).attr('href').substr(1);
    }

    /**
     * This function sets the page in the navigation view only,
     * because of this it should not get called outside of this class.
     */
    this._set_page = function(page)
    {
        var parts = page.split('/');
        $('.selected', this.nav_list).removeClass('selected');

        item = this._pages[page];
        if (item)
        {
            this.page = item;
            item.parentsUntil(this.nav_list, 'li').addBack().addClass('selected');
        }
        this._current_page = page;
        this._loading_page = false;
    };

    this.set_content_from_md = function(text, page)
    {
        this._set_page(page);
        html = self.converter.makeHtml(text);
        $('#content').html(html);
    };

    this.process_hash = function()
    {
        hash = window.location.hash.substring(1);
        if (hash)
        {
            if (hash == this._current_page)
                return
            var dir = hash.substr(0, hash.lastIndexOf('/') + 1);
            var load_page = hash.slice(-1) != '/';
            this.open_directory(dir, !load_page);
            if (load_page)  // if dir load new contents file
                this.load_page(hash)
        }
        else
        {
            this.open_directory('', false);
            this.load_page(this._home)
        }
    }

    // Constructor
    this.nav_list = $('nav ol');
    this._loading_page = false;
    this.converter = new showdown.Converter({simplifiedAutoLink: true, ghCodeBlocks: true});
    this._pages = {};
    
    $(window).on('hashchange', function()
    {
        self.process_hash();
    });

    this.process_hash();
}

function show_msg_box()
{
    box = $('#message-box');
    box.addClass('show');
    window.setTimeout(function(){box.removeClass('show');}, 5000);
}

$(function()
{
    window.nav = new Navigation();
})
