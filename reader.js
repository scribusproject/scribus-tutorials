Navigation = function()
{
    self = this;
    
    this.load_page = function(page_name)
    {
        this._loading_page = true;
        filename = page_name + '.md';
        $.ajax(
            {
                url: filename,
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
        window.location.hash = self._current_page;
    }

    /**
     * This function loads in a new contents file into the class.
     */
    this.process_contents_file = function(data)
    {
        this._pages = {};
        contents = data.split("\n")
        for (var i = 0; i < contents.length; i++)
        {
            entry = contents[i];
            if (entry === "")
                continue;

            this._pages[entry] = $('<li><a href=#'+ encodeURIComponent(entry) + '>' + entry + '</a></li>').appendTo(this.nav_list);
        }

        this._home = contents[0];
        if (this._current_page)
            this._set_page(this._current_page);
        else if (!this._loading_page)  // Ajax works asynchronously, let it finish.
            this.load_page(this._home);
    };

    /**
     * This function sets the page in the navigation view only,
     * because of this it should not get called outside of this class.
     */
    this._set_page = function(page)
    {
        if (this.page)
        {
            this.page.removeClass('selected');
            this.page = undefined;
        }

        item = this._pages[page];
        if (item)
        {
            this.page = item;
            item.addClass('selected');
        }
        this._current_page = page;
        this._loading_page = false;
    }

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
            if (hash != this._current_page)
                this.load_page(hash)
        }
        else if (this._home)
        {
            this.load_page(this._home)
        }
    }

    // Constructor
    this.nav_list = $('nav ol');
    this._loading_page = false;
    this.converter = new showdown.Converter({simplifiedAutoLink: true, ghCodeBlocks: true});
    this._pages = {}
    
    $(window).on('hashchange', function()
    {
        self.process_hash();
    });

    this.process_hash();
    $.ajax({url: 'contents', success: function(data){self.process_contents_file(data)}, mimeType: 'text/plain'});
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
