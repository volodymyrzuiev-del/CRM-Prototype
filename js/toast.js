(function () {
    var KINDS = {
        copied: { tone: "info", title: "Copied", text: "Warehouse details have been saved to your clipboard.", icon: "icons/toast/copy-toast.svg" },
        saved: { tone: "success", title: "Saved", text: "Changes have been successfully saved.", icon: "icons/controls/success-fill.svg" },
        created: { tone: "success", title: "Created", text: "New item has been successfully created.", icon: "icons/controls/success-fill.svg" },
        updated: { tone: "success", title: "Updated", text: "Item has been successfully updated.", icon: "icons/controls/success-fill.svg" },
        deleted: { tone: "success", title: "Delete", text: "Item has been successfully deleted.", icon: "icons/controls/success-fill.svg" },
        sent: { tone: "success", title: "Sent", text: "\"[Name]\" has been successfully sent.", icon: "icons/controls/success-fill.svg" },
        connection: { tone: "warning", title: "Connection lost", text: "Please check your internet connection and try again.", icon: "icons/controls/warn-fill.svg" },
        denied: { tone: "error", title: "Access Denied", text: "You do not have permission to perform this action.", icon: "icons/controls/error-fill.svg" },
        format: { tone: "error", title: "Unsupported file format", text: "Allowed formats:\nDocuments (PDF, DOC, DOCX, XLS, XLSX, CSV)\nImages (JPEG, PNG, HEIC).", icon: "icons/controls/error-fill.svg" },
        large: { tone: "error", title: "File is too large", text: "Maximum allowed file size is [X] MB.", icon: "icons/controls/error-fill.svg" },
        unreadable: { tone: "error", title: "File cannot be read", text: "The file is corrupted or empty. Please check it and try again.", icon: "icons/controls/error-fill.svg" },
        upload: { tone: "error", title: "Upload failed", text: "Unable to upload the file. Please try again or select another file.", icon: "icons/controls/error-fill.svg" },
        saveFailed: { tone: "error", title: "Upload failed", text: "Unable to save changes. Please try again.", icon: "icons/controls/error-fill.svg" },
        messageCopied: { tone: "info", title: "Copied", text: "Message text has been copied to your clipboard.", icon: "icons/toast/copy-toast.svg" },
        forwarded: { tone: "success", title: "Forwarded", text: "Message has been forwarded.", icon: "icons/controls/success-fill.svg" },
        pinned: { tone: "info", title: "Pinned", text: "Message is pinned at the top of the chat.", icon: "icons/controls/success-fill.svg" },
        archived: { tone: "success", title: "Archived", text: "\"[Name]\" has been moved to the archive.", icon: "icons/controls/success-fill.svg" },
        restored: { tone: "success", title: "Restored", text: "\"[Name]\" has been restored to active quotes.", icon: "icons/controls/success-fill.svg" },
        offerCreated: { tone: "success", title: "BID & Offer created", text: "The offer has been sent to drivers.", icon: "icons/controls/success-fill.svg" },
        booked: { tone: "success", title: "Booked", text: "\"[Name]\" has been booked for this load.", icon: "icons/controls/success-fill.svg" },
        checkSaved: { tone: "success", title: "Check saved", text: "\"[Name]\" has been added to the List.", icon: "icons/controls/success-fill.svg" },
        ruleConflict: { tone: "error", title: "Error: unsuccessful", text: "This broker is already on the opposite list. Remove it first.", icon: "icons/controls/error-fill.svg" }
    };

    function stack() {
        var node = document.getElementById("emp-toasts");
        if (node) return node;
        node = document.createElement("div");
        node.id = "emp-toasts";
        node.className = "emp-toasts";
        node.setAttribute("aria-live", "polite");
        document.body.appendChild(node);
        return node;
    }

    function fill(template, data) {
        return template.replace(/\[(Name|X)\]/g, function (token, key) {
            if (!data) return token;
            if (key === "Name" && data.name) return data.name;
            if (key === "X" && data.size) return data.size;
            return token;
        });
    }

    function showToast(kind, data) {
        var spec = KINDS[kind];
        if (!spec) return;
        var toast = document.createElement("div");
        toast.className = "emp-info emp-info--frame emp-info--" + spec.tone + " emp-toast";
        toast.setAttribute("role", "status");
        var head = document.createElement("div");
        head.className = "emp-info__head";
        var icon = document.createElement("img");
        icon.className = "emp-info__icon";
        icon.src = spec.icon;
        icon.width = 16;
        icon.height = 16;
        icon.alt = "";
        var title = document.createElement("strong");
        title.textContent = spec.title;
        var body = document.createElement("p");
        body.textContent = fill(spec.text, data);
        head.appendChild(icon);
        head.appendChild(title);
        toast.appendChild(head);
        toast.appendChild(body);
        stack().appendChild(toast);
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                toast.classList.add("is-show");
            });
        });
        setTimeout(function () {
            toast.classList.remove("is-show");
            setTimeout(function () {
                toast.remove();
            }, 250);
        }, 1500);
    }

    window.empToast = showToast;
})();
